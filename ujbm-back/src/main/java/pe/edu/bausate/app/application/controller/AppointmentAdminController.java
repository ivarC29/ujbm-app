package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.bausate.app.application.dto.interview.AppointmentResponse;
import pe.edu.bausate.app.application.dto.interview.AppointmentUpdateRequest;
import pe.edu.bausate.app.domain.service.AppointmentService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.APPOINTMENT_ADMIN)
@RequiredArgsConstructor
@Tag(name = "Appointment Admin", description = "Operaciones administrativas relacionadas a las citas de entrevistas")
public class AppointmentAdminController {

    private final AppointmentService appointmentService;

    @Operation(summary = "Obtener cita por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cita encontrada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Cita no encontrada"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(appointmentId));
    }

    @Operation(summary = "Obtener citas por ID de postulante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Citas encontradas exitosamente"),
            @ApiResponse(responseCode = "404", description = "Postulante no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByApplicantId(@PathVariable Long applicantId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByApplicantId(applicantId));
    }

    @Operation(summary = "Actualizar cita")
                @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Cita actualizada exitosamente"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
                        @ApiResponse(responseCode = "404", description = "Cita no encontrada"),
                        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
                })
                @PutMapping("/{appointmentId}")
                public ResponseEntity<AppointmentResponse> updateAppointment(
                        @PathVariable Long appointmentId,
                        @RequestBody AppointmentUpdateRequest request) {
                    return ResponseEntity.ok(appointmentService.updateAppointment(appointmentId, request));
                }

    @Operation(summary = "Actualizar estado de cita")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado de cita actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "404", description = "Cita no encontrada"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PatchMapping("/{appointmentId}/status")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestParam String statusCode) {
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(appointmentId, statusCode));
    }

    @Operation(summary = "Añadir notas a una cita")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Notas añadidas exitosamente"),
            @ApiResponse(responseCode = "404", description = "Cita no encontrada"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PatchMapping("/{appointmentId}/notes")
    public ResponseEntity<AppointmentResponse> addNotesToAppointment(
            @PathVariable Long appointmentId,
            @RequestParam String notes) {
        return ResponseEntity.ok(appointmentService.addNotesToAppointment(appointmentId, notes));
    }

    @Operation(summary = "Cancelar cita")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Cita cancelada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Cita no encontrada"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long appointmentId) {
        appointmentService.cancelAppointment(appointmentId);
        return ResponseEntity.noContent().build();
    }
}