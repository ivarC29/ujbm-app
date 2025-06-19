package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.bausate.app.application.dto.enrollment.EnrollmentAdminResponse;
import pe.edu.bausate.app.application.dto.enrollment.EnrollmentDetailsResponse;
import pe.edu.bausate.app.application.dto.enrollment.EnrollmentFilterRequest;
import pe.edu.bausate.app.domain.enumerate.EnrollmentStatus;
import pe.edu.bausate.app.domain.service.EnrollmentService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

@RestController
@RequestMapping(ApiPaths.ENROLLMENT_ADMIN)
@RequiredArgsConstructor
@Tag(name = "EnrollmentAdmin", description = "Operaciones relacionadas a la matricula de estudiantes para administradores")
public class EnrollmentAdminController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/table-filter")
    @Operation(summary = "Filtrar matrículas para administradores",
               description = "Devuelve una lista paginada de matrículas según los filtros aplicados")
    @ApiResponse(responseCode = "200", description = "Lista de matrículas encontrada")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<Page<EnrollmentAdminResponse>> filterEnrollments(
            @RequestBody EnrollmentFilterRequest filterRequest) {

        // Poner en PENDING status si no se especifica
        if (filterRequest.status() == null) {
            //para que si no se especifica el estado, se filtre por PENDING
            filterRequest = new EnrollmentFilterRequest(
                    EnrollmentStatus.PENDING,
                    null,
                    filterRequest.studentName(),
                    filterRequest.studentCode(),
                    filterRequest.academicPeriodId(),
                    filterRequest.programId(),
                    filterRequest.enrollmentDate(),
                    filterRequest.page(),
                    filterRequest.size(),
                    filterRequest.sortBy(),
                    filterRequest.sortDirection()
            );
        }

        return ResponseEntity.ok(enrollmentService.filterEnrollments(filterRequest));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalles de una matrícula específica",
               description = "Devuelve los detalles completos de una matrícula según su ID")
    @ApiResponse(responseCode = "200", description = "Matrícula encontrada")
    @ApiResponse(responseCode = "404", description = "Matrícula no encontrada")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<EnrollmentDetailsResponse> getEnrollmentDetails(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentDetailsById(id));
    }

    @PutMapping("/{id}/confirm")
    @Operation(summary = "Confirmar una matrícula",
               description = "Cambia el estado de una matrícula a CONFIRMADO")
    @ApiResponse(responseCode = "200", description = "Matrícula confirmada exitosamente")
    @ApiResponse(responseCode = "404", description = "Matrícula no encontrada")
    @ApiResponse(responseCode = "400", description = "La matrícula no está en estado pendiente")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<EnrollmentDetailsResponse> confirmEnrollment(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.confirmEnrollment(id));
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Rechazar una matrícula",
               description = "Cambia el estado de una matrícula a CANCELADO, restablece el estado de los detalles a NO REGISTRADO y actualiza las vacantes")
    @ApiResponse(responseCode = "200", description = "Matrícula rechazada exitosamente")
    @ApiResponse(responseCode = "404", description = "Matrícula no encontrada")
    @ApiResponse(responseCode = "400", description = "La matrícula no está en estado pendiente")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<EnrollmentDetailsResponse> rejectEnrollment(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.rejectEnrollment(id));
    }
}
