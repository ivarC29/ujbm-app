package pe.edu.bausate.app.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.bausate.app.application.dto.student.*;
import pe.edu.bausate.app.application.mapper.PersonMapper;
import pe.edu.bausate.app.application.mapper.StudentMapper;
import pe.edu.bausate.app.application.service.email.EmailService;
import pe.edu.bausate.app.domain.models.Person;
import pe.edu.bausate.app.domain.models.Program;
import pe.edu.bausate.app.domain.models.Student;
import pe.edu.bausate.app.domain.models.Ubigeo;
import pe.edu.bausate.app.domain.models.auth.User;
import pe.edu.bausate.app.domain.repository.*;
import pe.edu.bausate.app.domain.service.report.EnrollmentCertificateReport;
import pe.edu.bausate.app.domain.specification.StudentSpecification;
import pe.edu.bausate.app.infraestructure.exception.NotFoundException;
import pe.edu.bausate.app.infraestructure.util.helper.PageableUtils;
import pe.edu.bausate.app.infraestructure.util.helper.StudentUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final UbigeoRepository ubigeoRepository;
    private final ProgramRepository programRepository;

    private final UserService userService;
    private final EmailService emailService;

    private final PersonMapper personMapper;
    private final StudentMapper studentMapper;

    private final EnrollmentCertificateReport enrollmentCertificateReport;
    private final EnrollmentService enrollmentService;

    @Override
    public Page<StudentTableInfoResponse> filterStudents(StudentFilterRequest filterRequest) {
        PageRequest pageRequest = PageableUtils.fromFilterRequest(
                filterRequest.page(),
                filterRequest.size(),
                filterRequest.sortBy(),
                filterRequest.sortDirection()
        );
        Specification<Student> spec = StudentSpecification.filterBy(filterRequest);
        return studentRepository.findAll(spec, pageRequest)
                .map(studentMapper::studentToStudentTableInfoResponse);
    }

    @Transactional(readOnly = true)
    @Override
    public Optional<Long> findByUserId(Long userId) {
        return userRepository.findPersonIdById(userId)
                .flatMap(studentRepository::findIdByPersonId);
    }

    @Transactional
    @Override
    public StudentCreateResponse createStudent(StudentRequest request) {
        // Validar Program
        Program program = programRepository.findById(request.programId())
                .orElseThrow(() -> new NotFoundException("Programa no encontrado con ID: " + request.programId()));
        // 1. Mapear y guardar Person
        Ubigeo personUbigeo = ubigeoRepository.findByCodes(
                        request.person().ubigeo().departmentCode(),
                        request.person().ubigeo().provinceCode(),
                        request.person().ubigeo().districtCode())
                .orElseThrow(() -> new EntityNotFoundException("Ubigeo persona no encontrado"));

        Person person = personMapper.personRequestToPerson(request.person());
        person.setUbigeo(personUbigeo);
        person.setAvailable(true);
        person = personRepository.save(person);

        // 2. Mapear y guardar Student
        Student student = studentMapper.studentRequestToStudent(request);

        student.setPerson(person);
        student.setAvailable(true);
        String code = StudentUtils.generateUniqueStudentCode(studentRepository);
        student.setCode(code);
        student.setProgram(program);
        student.setCycle(request.cycle());
        student.setEnrollmentDate(request.enrollmentDate());

        student = studentRepository.save(student);

        // 3. Crear y guardar User
        User userStudent = userService.createStudentUser(student);
        String plainPassword = userStudent.getRawPassword();

        //Generar su Prenrollment
        enrollmentService.generatePreEnrollment(student);


        // 4. Enviar correo
        StudentUtils.sendWelcomeEmailWithCredentials(student, plainPassword, emailService, enrollmentCertificateReport);

        // 5. Retornar respuesta
        return new StudentCreateResponse(
                student.getId(),
                student.getCode(),

                person.getName() + " " + person.getLastname(),
                person.getEmail(),
                "Usuario creado correctamente. Se ha enviado un correo de bienvenida a " + person.getEmail()
        );
    }

    @Transactional(readOnly = true)
    @Override
    public StudentResponse findById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Estudiante no encontrado con ID: " + id));
        if (Boolean.FALSE.equals(student.getAvailable())) {
            throw new NotFoundException("El estudiante con ID: " + id + " ha sido eliminado.");
        }
        return studentMapper.studentToStudentResponse(student);
    }

    @Transactional
    @Override
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Estudiante no encontrado con ID: " + id));
        if (Boolean.FALSE.equals(student.getAvailable())) {
            throw new NotFoundException("El estudiante con ID: " + id + " ha sido eliminado.");
        }
        //Validar Ubigeo
        Ubigeo personUbigeo = ubigeoRepository.findByCodes(
                        request.person().ubigeo().departmentCode(),
                        request.person().ubigeo().provinceCode(),
                        request.person().ubigeo().districtCode())
                .orElseThrow(() -> new EntityNotFoundException("Ubigeo persona no encontrado"));

        // Actualizar campos del estudiante
        student.setEnrollmentDate(request.enrollmentDate());

        // Actualizar programa académico si es necesario
        if (request.programId() != null) {
            // Busca el programa y lo asigna (requiere inyectar ProgramRepository)
            Program program = programRepository.findById(request.programId())
                    .orElseThrow(() -> new NotFoundException("Programa no encontrado con ID: " + request.programId()));
            student.setProgram(program);
        }

        // Actualizar datos de la persona asociada
        personMapper.updatePersonFromDto(request.person(), student.getPerson());
        student.getPerson().setUbigeo(personUbigeo);
        student = studentRepository.save(student);
        return studentMapper.studentToStudentResponse(student);
    }

    @Transactional
    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Estudiante no encontrado con ID: " + id));

        if (Boolean.FALSE.equals(student.getAvailable())) {
            throw new RuntimeException("El estudiante con ID: " + id + " ya ha sido eliminado.");
        }

        student.setAvailable(false);
        studentRepository.save(student);
        userService.deleteUserByUsername(student.getCode().toLowerCase());
    }
    @Transactional(readOnly = true)
    @Override
    public Optional<Student> findByCode(String code) {
        return studentRepository.findByCode(code);
    }

}
