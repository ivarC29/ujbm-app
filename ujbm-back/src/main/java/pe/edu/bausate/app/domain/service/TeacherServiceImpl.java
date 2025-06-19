package pe.edu.bausate.app.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.bausate.app.application.dto.teacher.*;
import pe.edu.bausate.app.application.mapper.PersonMapper;
import pe.edu.bausate.app.application.mapper.TeacherMapper;
import pe.edu.bausate.app.application.service.email.EmailService;
import pe.edu.bausate.app.domain.models.Person;
import pe.edu.bausate.app.domain.models.Teacher;
import pe.edu.bausate.app.domain.models.Ubigeo;
import pe.edu.bausate.app.domain.models.auth.User;
import pe.edu.bausate.app.domain.repository.*;
import pe.edu.bausate.app.domain.specification.TeacherSpecification;
import pe.edu.bausate.app.infraestructure.exception.NotFoundException;
import pe.edu.bausate.app.infraestructure.util.helper.PageableUtils;
import pe.edu.bausate.app.infraestructure.util.helper.TeacherUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class TeacherServiceImpl implements TeacherService {
    private final TeacherRepository teacherRepository;
    private final PersonRepository personRepository;
    private final UserRepository userRepository;
    private final UbigeoRepository ubigeoRepository;

    private final EmailService emailService;
    private final UserService userService;

    private final PersonMapper personMapper;
    private final TeacherMapper teacherMapper;

    @Transactional(readOnly = true)
    @Override
    public Optional<Long> findByUserId(Long userId) {
        return userRepository.findPersonIdById(userId)
                .flatMap(teacherRepository::findIdByPersonId);
    }

    @Override
    public List<TeacherAutocompleteResponse> autocompleteAvailableTeachers(String query) {
        return teacherRepository.findAvailableByFullNameContaining(query).stream()
                .map(t -> new TeacherAutocompleteResponse(
                        t.getId(),
                        t.getPerson().getName() + " " + t.getPerson().getLastname()
                ))
                .toList();
    }

    @Transactional
    @Override
    public TeacherCreateResponse createTeacher(TeacherRequest request) {
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

        // 2. Mapear y guardar Teacher
        Teacher teacher = teacherMapper.teacherRequestToTeacher(request);
        teacher.setPerson(person);
        teacher.setAvailable(true);
        String code = TeacherUtils.generateUniqueTeacherCode(teacherRepository);
        teacher.setCode(code);
        teacher = teacherRepository.save(teacher);

        // 3. Crear y guardar User
        User userTeacher = userService.createTeacherUser(teacher);
        String plainPassword = userTeacher.getRawPassword();

        // 4. Enviar correo
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", person.getName());
        variables.put("lastname", person.getLastname());
        variables.put("username", userTeacher.getUsername());
        variables.put("password", plainPassword);
        variables.put("logoUrl", "https://bausate.edu.pe/wp-content/uploads/2021/11/cropped-Logo_ico-180x180.png");
        emailService.send("teacher-welcome", person.getEmail(), variables);

        return new TeacherCreateResponse(
                teacher.getId(),
                teacher.getCode(),
                person.getName() + " " + person.getLastname(),
                person.getEmail(),
                "Usuario creado correctamente. Se ha enviado un correo de bienvenida a " + person.getEmail()
        );
    }

    @Override
    public Page<TeacherTableInfoResponse> filterTeachers(TeacherFilterRequest filterRequest) {
        PageRequest pageRequest = PageableUtils.fromFilterRequest(
                filterRequest.page(),
                filterRequest.size(),
                filterRequest.sortBy(),
                filterRequest.sortDirection()
        );

        Specification<Teacher> spec = TeacherSpecification.filterBy(filterRequest);
        return teacherRepository.findAll(spec, pageRequest)
                .map(teacherMapper::teacherToTeacherTableInfoResponse);
    }

    @Transactional(readOnly = true)
    @Override
    public TeacherResponse findById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Docente no encontrado con ID: " + id));

        if (Boolean.FALSE.equals(teacher.getAvailable())) {
            throw new NotFoundException("El docente con ID: " + id + " ha sido eliminado.");
        }

        return teacherMapper.teacherToTeacherResponse(teacher);
    }

    @Transactional
    @Override
    public TeacherResponse updateTeacher(Long id, TeacherRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Docente no encontrado"));
        Ubigeo personUbigeo = ubigeoRepository.findByCodes(
                        request.person().ubigeo().departmentCode(),
                        request.person().ubigeo().provinceCode(),
                        request.person().ubigeo().districtCode())
                .orElseThrow(() -> new EntityNotFoundException("Ubigeo persona no encontrado"));

        teacher.setProfessionalTitle(request.professionalTitle());
        teacher.setAcademicDegree(request.academicDegree());
        teacher.setHireDate(request.hireDate());
        teacher.setIsFullTime(request.isFullTime());

        personMapper.updatePersonFromDto(request.person(), teacher.getPerson());
        teacher.getPerson().setUbigeo(personUbigeo);

        teacher = teacherRepository.save(teacher);
        return teacherMapper.teacherToTeacherResponse(teacher);
    }

    @Transactional
    @Override
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Docente no encontrado con ID: " + id));

        if (Boolean.FALSE.equals(teacher.getAvailable())) {
            throw new NotFoundException("El docente con ID: " + id + " ya ha sido eliminado.");
        }

        teacher.setAvailable(false);
        teacherRepository.save(teacher);
        userService.deleteUserByUsername(teacher.getCode().toLowerCase());
    }

    @Transactional(readOnly = true)
    @Override
    public Optional<Teacher> findByCode(String code) {
        return teacherRepository.findByCode(code);
    }
}
