package pe.edu.bausate.app.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.bausate.app.application.dto.WeeklyScheduleResponse;
import pe.edu.bausate.app.application.dto.coursesection.CourseSectionResponse;
import pe.edu.bausate.app.application.dto.coursesection.CourseSectionWithDetailStatusResponse;
import pe.edu.bausate.app.application.dto.enrollment.*;
import pe.edu.bausate.app.domain.enumerate.EnrollmentDetailStatus;
import pe.edu.bausate.app.domain.enumerate.EnrollmentStatus;
import pe.edu.bausate.app.domain.models.*;
import pe.edu.bausate.app.domain.models.projection.AcademicPeriodProjection;
import pe.edu.bausate.app.domain.repository.*;
import pe.edu.bausate.app.domain.specification.EnrollmentSpecification;
import pe.edu.bausate.app.infraestructure.exception.NotFoundException;
import pe.edu.bausate.app.infraestructure.util.helper.PageableUtils;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService{

    private final AcademicPeriodRepository academicPeriodRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentDetailRepository enrollmentDetailRepository;

    @Override
    @Transactional
    public void generatePreEnrollment(Student student) {
        // 1. Obtener periodo académico actual
        AcademicPeriodProjection currentPeriodProjection = academicPeriodRepository
                .findCurrentAcademicPeriod()
                .orElseThrow(() -> new NotFoundException("No hay periodo académico disponible"));

        // Obtener la entidad AcademicPeriod completa
        AcademicPeriod currentAcademicPeriod = academicPeriodRepository
                .findById(currentPeriodProjection.getId())
                .orElseThrow(() -> new NotFoundException("No se encontró el periodo académico con ID: " + currentPeriodProjection.getId()));

        // TODO: Generar atributo en studen que indique su ciclo relativo

        // 1. Obtener el ciclo del estudiante
        Integer studentCycle = student.getCycle();

        // 2. Obtener secciones disponibles para el estudiante
        List<CourseSection> availableSections = getAvailableSectionsForStudent(
                student,
                studentCycle,
                currentAcademicPeriod.getId()
        );

        // Verificar si hay secciones disponibles
        if (availableSections.isEmpty()) {
            throw new NotFoundException("No hay secciones disponibles para matricular");
        }

        // 3. Crear una única matrícula para el estudiante
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .academicPeriod(currentAcademicPeriod)
                .enrollmentDate(LocalDate.now())
                .status(EnrollmentStatus.DRAFT) // Estado inicial de borrador
                .enrollmentDetails(new ArrayList<>())
                .available(true)
                .build();


//         4. Crear un detalle por cada sección disponible
        for (CourseSection section : availableSections) {
            EnrollmentDetail detail = EnrollmentDetail.builder()
                    .enrollment(enrollment)
                    .courseSection(section)
                    .status(EnrollmentDetailStatus.NOT_REGISTERED) // Estado inicial
                    .available(true)
                    .build();

            enrollment.getEnrollmentDetails().add(detail);
        }
        enrollmentRepository.save(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> findEnrollmentsByStudentId(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new NotFoundException("Estudiante no encontrado");
        }

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);

        return enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EnrollmentResponse> findEnrollmentById(Long enrollmentId, Long studentId) {
        return enrollmentRepository.findByIdAndStudentId(enrollmentId, studentId)
                .map(this::mapToEnrollmentResponse);
    }

    /**
         * Obtiene las secciones de curso disponibles para un estudiante en un ciclo y periodo académico específicos.
         * Si el estudiante ya tiene cursos aprobados, se excluyen de la lista.
         */
    private List<CourseSection> getAvailableSectionsForStudent(Student student, Integer cycle, Long academicPeriodId) {
            // Obtener secciones de curso disponibles para el estudiante
        List<CourseSection> availableSections = courseSectionRepository
                .findByProgramIdAndCycleAndPeriodIdAndAvailableIsTrue(
                        student.getProgram().getId(),
                        cycle,
                        academicPeriodId
                );

        // Obtener los IDs de los cursos aprobados por el estudiante
        List<Long> approvedCourseIds = enrollmentDetailRepository.findCourseIdsByStudentIdAndStatus(
                student.getId(), EnrollmentDetailStatus.APPROVED);

        // Filtrar las secciones de curso para excluir aquellas cuyos cursos ya están aprobados
        if (!approvedCourseIds.isEmpty()) {
               availableSections = availableSections.stream()
                       .filter(section -> !approvedCourseIds.contains(section.getCourse().getId()))
                       .collect(Collectors.toList());
        }

        return availableSections;
    }

    @Override
    @Transactional(readOnly = true)
    public EnrollmentStatusWithAvailableCourseSectionsResponse getAvailableCourseSectionsForStudent(Long studentId, CourseSectionService courseSectionService) {
        // Info de estudiante
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Estudiante no encontrado con ID: " + studentId));

        // Verificar si el estudiante está activo
        if (!student.getAvailable()) {
            throw new IllegalStateException("El estudiante no está activo");
        }

        // Obtener las matrículas del estudiante
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);

        if (enrollments.isEmpty()) {
            throw new NotFoundException("No hay matrículas para este alumno");
        }

        // Usar la matrícula más reciente
        Enrollment enrollment = enrollments.stream()
                .max((e1, e2) -> e1.getEnrollmentDate().compareTo(e2.getEnrollmentDate()))
                .orElseThrow(() -> new NotFoundException("No hay matrícula para este alumno"));

        // verificar si la matrícula está activa
        if (!enrollment.getAvailable()) {
            throw new IllegalStateException("La matrícula no está activa");
        }

        EnrollmentStatus enrollmentStatus = enrollment.getStatus();
        AcademicPeriod academicPeriod = enrollment.getAcademicPeriod();

        // Si la matrícula no está en estado DRAFT o CANCELLED, no se pueden seleccionar cursos
        if (enrollmentStatus != EnrollmentStatus.DRAFT && enrollmentStatus != EnrollmentStatus.CANCELLED) {
            return new EnrollmentStatusWithAvailableCourseSectionsResponse(
                enrollmentStatus,
                enrollment.getId(),
                student.getPerson().getName(),
                student.getPerson().getLastname(),
                student.getCycle(),
                academicPeriod.getName(),
                academicPeriod.getId(),
                List.of()
            );
        }

        // Obtener TODOS los IDs de los cursos aprobados por el estudiante en CUALQUIER periodo
        List<Long> approvedCourseIds = enrollmentDetailRepository.findCourseIdsByStudentIdAndStatus(
                studentId, EnrollmentDetailStatus.APPROVED);

        // Obtener las secciones de curso disponibles para el estudiante
        List<CourseSectionWithDetailStatusResponse> availableSections = new ArrayList<>();

        for (EnrollmentDetail detail : enrollment.getEnrollmentDetails()) {
            // si algun detalle esta desactivado, no se agrega
            if (!detail.getAvailable()) {
                continue;
            }

            CourseSection courseSection = detail.getCourseSection();

            // si alguna sección de curso está desactivada, no se agrega
            if (!courseSection.getAvailable()) {
                continue;
            }
            Long sectionId = detail.getCourseSection().getId();
            Long courseId = detail.getCourseSection().getCourse().getId();

            // Si el curso ya está aprobado en cualquier periodo, no se agrega
            if (approvedCourseIds.contains(courseId)) {
                continue;
            }

            Optional<CourseSectionResponse> sectionOpt = courseSectionService.findById(sectionId);

            if (sectionOpt.isPresent()) {
                CourseSectionResponse section = sectionOpt.get();

                // Solo incluir secciones con vacantes disponibles
                if (section.vacancies() != null && section.vacancies() > 0) {
                    availableSections.add(new CourseSectionWithDetailStatusResponse(
                        section,
                        detail.getStatus(),
                        detail.getId() // Add enrollment detail ID
                    ));
                }
            }
        }

        return new EnrollmentStatusWithAvailableCourseSectionsResponse(
            enrollmentStatus,
            enrollment.getId(),
            student.getPerson().getName(),
            student.getPerson().getLastname(),
            student.getCycle(),
            academicPeriod.getName(),
            academicPeriod.getId(),
            availableSections
        );
    }

    @Transactional
    @Override
    public EnrollmentResponse submitEnrollment(Long studentId, EnrollmentRequest request) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Estudiante no encontrado con ID: " + studentId));
        // Verificar si el estudiante está activo
        if (!student.getAvailable()) {
            throw new IllegalStateException("El estudiante no está activo");
        }

        // confirmar matricula
        Enrollment enrollment = enrollmentRepository.findByStudentId(studentId).stream()
                .max((e1, e2) -> e1.getEnrollmentDate().compareTo(e2.getEnrollmentDate()))
                .orElseThrow(() -> new NotFoundException("No hay matrícula activa para este estudiante"));
        // verificar si la matrícula está activa
        if (!enrollment.getAvailable()) {
            throw new IllegalStateException("La matrícula no está activa");
        }

        if (enrollment.getStatus() != EnrollmentStatus.DRAFT && enrollment.getStatus() != EnrollmentStatus.CANCELLED) {
            throw new IllegalStateException("Solo se pueden confirmar matrículas en estado borrador o cancelado");
        }

        // validar que los detalles de matrícula existan
        List<EnrollmentDetail> detailsToRegister = enrollmentDetailRepository.findAllById(request.enrollmentDetailIds());

        if (detailsToRegister.size() != request.enrollmentDetailIds().size()) {
            throw new NotFoundException("Uno o más detalles de matrícula no existen");
        }

        // verificar que los detalles de matrícula pertenezcan a la matrícula actual del estudiante
        for (EnrollmentDetail detail : detailsToRegister) {
            // ver que el detalle de matrícula esté activo
            if (!detail.getAvailable()) {
                throw new IllegalStateException("El detalle de matrícula con ID " + detail.getId() + " no está activo");
            }

            if (!detail.getEnrollment().getId().equals(enrollment.getId())) {
                throw new IllegalArgumentException("El detalle de matrícula con ID " + detail.getId() +
                        " no pertenece a la matrícula actual del estudiante");
            }

            // Verificar cada detalle de matrícula tenga el estado NOT_REGISTERED
            if (detail.getStatus() != EnrollmentDetailStatus.NOT_REGISTERED) {
                throw new IllegalArgumentException("El curso " + detail.getCourseSection().getCourse().getName() +
                        " ya ha sido registrado o tiene otro estado que no permite su selección");
            }

            // vacantes de la sección de curso
            if (detail.getCourseSection().getVacancies() <= 0) {
                throw new IllegalArgumentException("La sección " + detail.getCourseSection().getSection() +
                        " del curso " + detail.getCourseSection().getCourse().getName() + " no tiene vacantes disponibles");
            }
        }

        // Check for schedule conflicts among selected courses
        validateScheduleConflicts(detailsToRegister);

        // Update enrollment status
        enrollment.setStatus(EnrollmentStatus.PENDING);

        // Update each selected enrollment detail status
        for (EnrollmentDetail detail : detailsToRegister) {
            detail.setStatus(EnrollmentDetailStatus.REGISTERED);
        }

        // Update course section vacancies
        for (EnrollmentDetail detail : detailsToRegister) {
            CourseSection section = detail.getCourseSection();
            section.setVacancies(section.getVacancies() - 1);
            courseSectionRepository.save(section);
        }

        // Save changes
        enrollmentRepository.save(enrollment);

        return mapToEnrollmentResponse(enrollment);
    }

    /**
     * Validates that there are no schedule conflicts among selected course sections
     */
    private void validateScheduleConflicts(List<EnrollmentDetail> details) {
        for (int i = 0; i < details.size(); i++) {
            CourseSection section1 = details.get(i).getCourseSection();
            List<WeeklySchedule> schedules1 = section1.getWeeklyScheduleList();

            for (int j = i + 1; j < details.size(); j++) {
                CourseSection section2 = details.get(j).getCourseSection();
                List<WeeklySchedule> schedules2 = section2.getWeeklyScheduleList();

                for (WeeklySchedule ws1 : schedules1) {
                    for (WeeklySchedule ws2 : schedules2) {
                        if (ws1.getDay() == ws2.getDay() &&
                                ws1.getStartTime().isBefore(ws2.getEndTime()) &&
                                ws2.getStartTime().isBefore(ws1.getEndTime())) {

                            throw new IllegalArgumentException(
                                "Conflicto de horarios entre " +
                                section1.getCourse().getName() + " (" + section1.getSection() + ") y " +
                                section2.getCourse().getName() + " (" + section2.getSection() + ") en " +
                                ws1.getDay() + " de " + ws1.getStartTime() + " a " + ws1.getEndTime()
                            );
                        }
                    }
                }
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EnrollmentAdminResponse> filterEnrollments(EnrollmentFilterRequest filterRequest) {
        PageRequest pageRequest = PageableUtils.fromFilterRequestWithJoins(
                filterRequest.page(),
                filterRequest.size(),
                filterRequest.sortBy(),
                filterRequest.sortDirection()
        );

        Specification<Enrollment> spec = EnrollmentSpecification.filterBy(filterRequest);

        Page<Enrollment> enrollmentsPage = enrollmentRepository.findAll(spec, pageRequest);
        return enrollmentsPage.map(this::mapToEnrollmentAdminResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public EnrollmentDetailsResponse getEnrollmentDetailsById(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new NotFoundException("Matrícula no encontrada con ID: " + enrollmentId));


        if (!enrollment.getAvailable()) {
            throw new IllegalStateException("La matrícula no está activa");
        }


        if (!enrollment.getStudent().getAvailable()) {
            throw new IllegalStateException("El estudiante asociado a esta matrícula no está activo");
        }

        // Map enrollment details
        List<EnrollmentDetailResponse> details = enrollment.getEnrollmentDetails().stream()
                .filter(detail -> detail.getStatus() == EnrollmentDetailStatus.REGISTERED)
                .map(detail -> EnrollmentDetailResponse.builder()
                        .id(detail.getId())
                        .courseSectionId(detail.getCourseSection().getId())
                        .courseCode(detail.getCourseSection().getCourse().getCode())
                        .courseName(detail.getCourseSection().getCourse().getName())
                        .section(detail.getCourseSection().getSection())
                        .credits(detail.getCourseSection().getCourse().getCredits())
                        .status(detail.getStatus())
                        .build())
                .collect(Collectors.toList());

        // respuesta de detalles de matrícula
        return EnrollmentDetailsResponse.builder()
                .id(enrollment.getId())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .status(enrollment.getStatus())
                .studentId(enrollment.getStudent().getId())
                .studentCode(enrollment.getStudent().getCode())
                .studentName(enrollment.getStudent().getPerson().getName() + " " + enrollment.getStudent().getPerson().getLastname())
                .programId(enrollment.getStudent().getProgram().getId())
                .programName(enrollment.getStudent().getProgram().getName())
                .academicPeriodId(enrollment.getAcademicPeriod().getId())
                .academicPeriodName(enrollment.getAcademicPeriod().getName())
                .details(details)
                .build();
    }

    @Override
    @Transactional
    public EnrollmentDetailsResponse confirmEnrollment(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new NotFoundException("Matrícula no encontrada con ID: " + enrollmentId));

        if (!enrollment.getAvailable()) {
            throw new IllegalStateException("La matrícula no está activa");
        }

        if (!enrollment.getStudent().getAvailable()) {
            throw new IllegalStateException("El estudiante asociado a esta matrícula no está activo");
        }

        // validar que la matrícula esté en estado PENDING
        if (enrollment.getStatus() != EnrollmentStatus.PENDING) {
            throw new IllegalStateException("Solo se pueden confirmar matrículas en estado pendiente. Estado actual: " +
                enrollment.getStatus().getDisplayName());
        }

        // verificar que todos los detalles de matrícula registrados estén activos
        for (EnrollmentDetail detail : enrollment.getEnrollmentDetails()) {
            if (detail.getStatus() == EnrollmentDetailStatus.REGISTERED) {
                if (!detail.getAvailable()) {
                    throw new IllegalStateException("El detalle de matrícula con ID " + detail.getId() + " no está activo");
                }
                if (!detail.getCourseSection().getAvailable()) {
                    throw new IllegalStateException("La sección " + detail.getCourseSection().getSection() +
                            " del curso " + detail.getCourseSection().getCourse().getName() + " no está activa");
                }
            }
        }

        // actualizar el estado de la matrícula a CONFIRMED
        enrollment.setStatus(EnrollmentStatus.CONFIRMED);

        // guardar la matrícula actualizada
        enrollmentRepository.save(enrollment);

        return getEnrollmentDetailsById(enrollmentId);
    }

    @Override
    @Transactional
    public EnrollmentDetailsResponse rejectEnrollment(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new NotFoundException("Matrícula no encontrada con ID: " + enrollmentId));

        if (!enrollment.getAvailable()) {
            throw new IllegalStateException("La matrícula no está activa");
        }

        if (!enrollment.getStudent().getAvailable()) {
            throw new IllegalStateException("El estudiante asociado a esta matrícula no está activo");
        }

        // validar que la matrícula esté en estado PENDING
        if (enrollment.getStatus() != EnrollmentStatus.PENDING) {
            throw new IllegalStateException("Solo se pueden rechazar matrículas en estado pendiente. Estado actual: " +
                enrollment.getStatus().getDisplayName());
        }

        // actualizar el estado de la matrícula a CANCELLED
        enrollment.setStatus(EnrollmentStatus.CANCELLED);

        // procesar cada detalle de matrícula
        for (EnrollmentDetail detail : enrollment.getEnrollmentDetails()) {
            // solo procesar detalles que estén registrados
            if (detail.getStatus() == EnrollmentDetailStatus.REGISTERED && detail.getAvailable()) {
                // cambiar el estado del detalle a NOT_REGISTERED
                detail.setStatus(EnrollmentDetailStatus.NOT_REGISTERED);

                // Increase vacancy count for the course section
                CourseSection courseSection = detail.getCourseSection();
                courseSection.setVacancies(courseSection.getVacancies() + 1);
                courseSectionRepository.save(courseSection);
            }
        }

        // Save the updated enrollment
        enrollmentRepository.save(enrollment);

        // Return the updated enrollment details
        return getEnrollmentDetailsById(enrollmentId);
    }

    @Override
    @Transactional(readOnly = true)
    public EnrollmentDetailsResponse getStudentConfirmedEnrollment(Long studentId) {
        // Verify student exists
        if (!studentRepository.existsById(studentId)) {
            throw new NotFoundException("Estudiante no encontrado con ID: " + studentId);
        }

        // buscar matrícula confirmada del estudiante
        List<Enrollment> confirmedEnrollments = enrollmentRepository.findByStudentIdAndStatus(studentId, EnrollmentStatus.CONFIRMED);

        if (confirmedEnrollments.isEmpty()) {
            throw new NotFoundException("No se encontró una matrícula confirmada para este estudiante");
        }

        Enrollment confirmedEnrollment = confirmedEnrollments.stream()
            .max(Comparator.comparing(Enrollment::getEnrollmentDate))
            .orElseThrow(() -> new NotFoundException("No se encontró una matrícula confirmada para este estudiante"));

        // Mapear detalles de matrícula
        List<EnrollmentDetailResponse> details = confirmedEnrollment.getEnrollmentDetails().stream()
                .filter(EnrollmentDetail ::getAvailable)
            .filter(detail -> detail.getStatus() == EnrollmentDetailStatus.REGISTERED)
            .map(detail -> EnrollmentDetailResponse.builder()
                .id(detail.getId())
                .courseSectionId(detail.getCourseSection().getId())
                .courseCode(detail.getCourseSection().getCourse().getCode())
                .courseName(detail.getCourseSection().getCourse().getName())
                .section(detail.getCourseSection().getSection())
                .credits(detail.getCourseSection().getCourse().getCredits())
                .status(detail.getStatus())
                .build())
            .collect(Collectors.toList());


        return EnrollmentDetailsResponse.builder()
                .id(confirmedEnrollment.getId())
                .enrollmentDate(confirmedEnrollment.getEnrollmentDate())
                .status(confirmedEnrollment.getStatus())
                .studentId(confirmedEnrollment.getStudent().getId())
                .studentCode(confirmedEnrollment.getStudent().getCode())
                .studentName(confirmedEnrollment.getStudent().getPerson().getName() + " " +
                    confirmedEnrollment.getStudent().getPerson().getLastname())
                .programId(confirmedEnrollment.getStudent().getProgram().getId())
                .programName(confirmedEnrollment.getStudent().getProgram().getName())
                .academicPeriodId(confirmedEnrollment.getAcademicPeriod().getId())
                .academicPeriodName(confirmedEnrollment.getAcademicPeriod().getName())
                .details(details)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public EnrollmentDetailsWithScheduleResponse getStudentConfirmedEnrollmentWithSchedules(Long studentId) {

        if (!studentRepository.existsById(studentId)) {
            throw new NotFoundException("Estudiante no encontrado con ID: " + studentId);
        }

        // buscar matrícula confirmada del estudiante
        List<Enrollment> confirmedEnrollments = enrollmentRepository.findByStudentIdAndStatus(studentId, EnrollmentStatus.CONFIRMED);

        if (confirmedEnrollments.isEmpty()) {
            throw new NotFoundException("No se encontró una matrícula confirmada para este estudiante");
        }

        Enrollment confirmedEnrollment = confirmedEnrollments.stream()
            .max(Comparator.comparing(Enrollment::getEnrollmentDate))
            .orElseThrow(() -> new NotFoundException("No se encontró una matrícula confirmada para este estudiante"));

        // Map enrollment details con horarios
        List<EnrollmentDetailWithScheduleResponse> details = confirmedEnrollment.getEnrollmentDetails().stream()
            .filter(EnrollmentDetail::getAvailable)
            .filter(detail -> detail.getStatus() == EnrollmentDetailStatus.REGISTERED)
            .map(detail -> {
                // Map weekly schedules
                List<WeeklyScheduleResponse> schedules = detail.getCourseSection().getWeeklyScheduleList().stream()
                        .map(schedule -> new WeeklyScheduleResponse(
                                schedule.getId(),
                                schedule.getDay(),
                                schedule.getStartTime(),
                                schedule.getEndTime(),
                                schedule.getAvailable()
                        ))
                        .toList();

                // nombre del profesor
                String teacherName = detail.getCourseSection().getTeacher() != null ?
                        detail.getCourseSection().getTeacher().getPerson().getName() + " " +
                                detail.getCourseSection().getTeacher().getPerson().getLastname() :
                        "No asignado";

                return EnrollmentDetailWithScheduleResponse.builder()
                    .id(detail.getId())
                    .courseSectionId(detail.getCourseSection().getId())
                    .courseCode(detail.getCourseSection().getCourse().getCode())
                    .courseName(detail.getCourseSection().getCourse().getName())
                    .section(detail.getCourseSection().getSection())
                    .credits(detail.getCourseSection().getCourse().getCredits())
                    .status(detail.getStatus())
                    .schedules(schedules)
                    .teacherName(teacherName)
                    .build();
            })
            .toList();

        return EnrollmentDetailsWithScheduleResponse.builder()
                .id(confirmedEnrollment.getId())
                .enrollmentDate(confirmedEnrollment.getEnrollmentDate())
                .status(confirmedEnrollment.getStatus())
                .studentId(confirmedEnrollment.getStudent().getId())
                .studentCode(confirmedEnrollment.getStudent().getCode())
                .studentName(confirmedEnrollment.getStudent().getPerson().getName() + " " +
                    confirmedEnrollment.getStudent().getPerson().getLastname())
                .programId(confirmedEnrollment.getStudent().getProgram().getId())
                .programName(confirmedEnrollment.getStudent().getProgram().getName())
                .academicPeriodId(confirmedEnrollment.getAcademicPeriod().getId())
                .academicPeriodName(confirmedEnrollment.getAcademicPeriod().getName())
                .details(details)
                .build();
    }

    // Helper method para mapear a EnrollmentAdminResponse
    private EnrollmentAdminResponse mapToEnrollmentAdminResponse(Enrollment enrollment) {
        return EnrollmentAdminResponse.builder()
                .id(enrollment.getId())
                .studentCode(enrollment.getStudent().getCode())
                .studentName(enrollment.getStudent().getPerson().getName() + " " + enrollment.getStudent().getPerson().getLastname())
                .programId(enrollment.getStudent().getProgram().getId())
                .programName(enrollment.getStudent().getProgram().getName())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .status(enrollment.getStatus())
                .academicPeriodId(enrollment.getAcademicPeriod().getId())
                .academicPeriodName(enrollment.getAcademicPeriod().getName())
                .totalCourses((int) enrollment.getEnrollmentDetails().stream()
                        .filter(detail -> detail.getStatus() == EnrollmentDetailStatus.REGISTERED)
                        .count())
                .build();
    }

    // FIXME: Pasarlo a enrollmentUtils como funcion statica si es que usamos codigo
    private String generateEnrollmentCode() {
        return "ENR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // FIXME: Cambiar a un mapper
    private EnrollmentResponse mapToEnrollmentResponse(Enrollment enrollment) {
        List<EnrollmentDetailResponse> detailResponses = enrollment.getEnrollmentDetails().stream()
                .map(detail -> EnrollmentDetailResponse.builder()
                        .id(detail.getId())
                        .courseSectionId(detail.getCourseSection().getId())
                        .courseCode(detail.getCourseSection().getCourse().getCode())
                        .courseName(detail.getCourseSection().getCourse().getName())
                        .section(detail.getCourseSection().getSection())
                        .credits(detail.getCourseSection().getCourse().getCredits())
                        .build())
                .collect(Collectors.toList());

        return EnrollmentResponse.builder()
                .id(enrollment.getId())
//                .code(enrollment.getCode())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .status(enrollment.getStatus().name())
                .details(detailResponses)
                .build();
    }
}
