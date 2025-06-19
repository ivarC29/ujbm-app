package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.bausate.app.application.dto.interview.InterviewerCreateRequest;
import pe.edu.bausate.app.application.dto.interview.InterviewerResponseDto;
import pe.edu.bausate.app.application.dto.interview.InterviewerSelectResponse;
import pe.edu.bausate.app.domain.service.InterviewerAvailabilityService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.INTERVIEWER_ADMIN)
@RequiredArgsConstructor
@Tag(name = "Interviewer Admin", description = "Operaciones administrativas relacionadas a los entrevistadores")
public class InterviewerAdminController {

    private final InterviewerAvailabilityService interviewerAdminService;

    @Operation(summary = "Crear un entrevistador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Entrevistador creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping
    public ResponseEntity<InterviewerResponseDto> createInterviewer(@RequestBody InterviewerCreateRequest request) {
        InterviewerResponseDto dto = interviewerAdminService.createInterviewer(request);
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "Listar todos los entrevistadores")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de entrevistadores obtenida exitosamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping
    public ResponseEntity<List<InterviewerResponseDto>> getAllInterviewers() {
        return ResponseEntity.ok(interviewerAdminService.getAllInterviewers());
    }

    @Operation(summary = "Obtener entrevistador por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Entrevistador encontrado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Entrevistador no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/{id}")
    public ResponseEntity<InterviewerResponseDto> getInterviewerById(@PathVariable Long id) {
        return ResponseEntity.ok(interviewerAdminService.getInterviewerById(id));
    }

    @Operation(summary = "Obtener todos los entrevistadores para selector")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Entrevistadores obtenidos exitosamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping("/select")
    public ResponseEntity<List<InterviewerSelectResponse>> getAllInterviewersForSelect() {
        return ResponseEntity.ok(interviewerAdminService.findAllInterviewersForSelect());
    }

    @Operation(summary = "Actualizar entrevistador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Entrevistador actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "404", description = "Entrevistador no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PutMapping("/{id}")
    public ResponseEntity<InterviewerResponseDto> updateInterviewer(
            @PathVariable Long id,
            @RequestBody InterviewerCreateRequest request) {
        return ResponseEntity.ok(interviewerAdminService.updateInterviewer(id, request));
    }

    @Operation(summary = "Eliminar entrevistador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Entrevistador eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Entrevistador no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterviewer(@PathVariable Long id) {
        interviewerAdminService.deleteInterviewer(id);
        return ResponseEntity.noContent().build();
    }
}