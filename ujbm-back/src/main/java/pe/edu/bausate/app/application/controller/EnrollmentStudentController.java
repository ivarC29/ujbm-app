package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.edu.bausate.app.application.dto.coursesection.CourseSectionWithDetailStatusResponse;
import pe.edu.bausate.app.application.dto.enrollment.*;
import pe.edu.bausate.app.domain.service.CourseSectionService;
import pe.edu.bausate.app.domain.service.EnrollmentService;
import pe.edu.bausate.app.domain.service.StudentService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;
import pe.edu.bausate.app.infraestructure.exception.NotFoundException;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.ENROLLMENT_STUDENT)
@RequiredArgsConstructor
@Tag(name = "EnrollmentStudent", description = "Operaciones relacionadas a la inscripción de estudiantes")
public class EnrollmentStudentController {

    private final EnrollmentService enrollmentService;
    private final CourseSectionService courseSectionService;
    private final StudentService studentService;


     @GetMapping("/available-course-sections")
     @Operation(summary = "Obtener secciones de curso disponibles para matrícula")
     @ApiResponse(responseCode = "200", description = "Lista de secciones disponibles")
     public ResponseEntity<EnrollmentStatusWithAvailableCourseSectionsResponse> getAvailableCourseSections(Authentication authentication) {
         Long studentId = getCurrentStudentId(authentication);
         EnrollmentStatusWithAvailableCourseSectionsResponse result =
             enrollmentService.getAvailableCourseSectionsForStudent(studentId, courseSectionService);
         return ResponseEntity.ok(result);
     }

    @PostMapping("/submit")
    @Operation(summary = "Confirmar selección de cursos para matrícula")
    @ApiResponse(responseCode = "200", description = "Solicitud de matrícula creada exitosamente")
    public ResponseEntity<EnrollmentResponse> submitEnrollment(
            @Valid @RequestBody EnrollmentRequest request,
            Authentication authentication) {
        Long studentId = getCurrentStudentId(authentication);
        EnrollmentResponse response = enrollmentService.submitEnrollment(studentId, request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/enrolled-sections")
    @Operation(summary = "Obtener las secciones matriculadas del estudiante",
               description = "Devuelve los detalles de matrícula confirmada del estudiante actual")
    @ApiResponse(responseCode = "200", description = "Detalles de matrícula encontrados")
    @ApiResponse(responseCode = "404", description = "No se encontró matrícula confirmada")
    public ResponseEntity<EnrollmentDetailsResponse> getEnrolledSections(Authentication authentication) {
        Long studentId = getCurrentStudentId(authentication);
        EnrollmentDetailsResponse response = enrollmentService.getStudentConfirmedEnrollment(studentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/enrolled-sections-with-schedules")
    @Operation(summary = "Obtener las secciones matriculadas del estudiante con horarios",
               description = "Devuelve los detalles de matrícula confirmada del estudiante con información de horarios")
    @ApiResponse(responseCode = "200", description = "Detalles de matrícula encontrados")
    @ApiResponse(responseCode = "404", description = "No se encontró matrícula confirmada")
    public ResponseEntity<EnrollmentDetailsWithScheduleResponse> getEnrolledSectionsWithSchedules(Authentication authentication) {
        Long studentId = getCurrentStudentId(authentication);
        EnrollmentDetailsWithScheduleResponse response = enrollmentService.getStudentConfirmedEnrollmentWithSchedules(studentId);
        return ResponseEntity.ok(response);
    }



    //no estoy usando
    @GetMapping
    @Operation(summary = "Obtener todas las solicitudes de matrícula del estudiante")
    @ApiResponse(responseCode = "200", description = "Lista de solicitudes de matrícula")
    public ResponseEntity<List<EnrollmentResponse>> getAllEnrollments(Authentication authentication) {
        Long studentId = getCurrentStudentId(authentication);
        List<EnrollmentResponse> enrollments = enrollmentService.findEnrollmentsByStudentId(studentId);
        return ResponseEntity.ok(enrollments);
    }
    //no estoy usando
    @GetMapping("/{id}")
    @Operation(summary = "Obtener una solicitud de matrícula específica")
    @ApiResponse(responseCode = "200", description = "Solicitud de matrícula encontrada")
    @ApiResponse(responseCode = "404", description = "Solicitud de matrícula no encontrada")
    public ResponseEntity<EnrollmentResponse> getEnrollmentById(@PathVariable Long id, Authentication authentication) {
        Long studentId = getCurrentStudentId(authentication);
        return enrollmentService.findEnrollmentById(id, studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private Long getCurrentStudentId(Authentication authentication) {
        String username = authentication.getName();
        return studentService.findByCode(username.toUpperCase())
                .orElseThrow(() -> new NotFoundException("No se encontró un estudiante asociado al usuario: " + username))
                .getId();
    }
}
