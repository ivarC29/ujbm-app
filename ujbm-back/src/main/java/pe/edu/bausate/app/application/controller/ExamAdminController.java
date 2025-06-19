package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.bausate.app.application.dto.exam.*;
import pe.edu.bausate.app.domain.repository.ExamRepository;
import pe.edu.bausate.app.domain.service.ExamService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.util.List;


@RestController
@RequestMapping(ApiPaths.EXAM_ADMIN)
@RequiredArgsConstructor
@Tag(name = "Administración de Exámenes", description = "Endpoints para la gestión de exámenes")
public class ExamAdminController {

    private final ExamService examService;
    private final ExamRepository examRepository;

    @PostMapping
    @Operation(summary = "Crear un nuevo examen", description = "Crea un examen con sus preguntas y respuestas")
    @ApiResponse(responseCode = "201", description = "Examen creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Solicitud inválida")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<ExamCreateResponse> createExam(@Valid @RequestBody ExamCreateRequest request) {
        Long examId = examService.createExam(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ExamCreateResponse(examId, "Examen creado exitosamente"));
    }

    @PostMapping("/excel")
    @Operation(summary = "Crear un examen desde Excel", description = "Crea un examen importando datos desde un archivo Excel")
    @ApiResponse(responseCode = "201", description = "Examen creado exitosamente desde Excel")
    @ApiResponse(responseCode = "400", description = "Solicitud inválida")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<ExamCreateResponse> createExamByExcel(@Valid @RequestBody ExamByExcelRequest request) {
        Long examId = examService.createExamByExcel(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ExamCreateResponse(examId, "Examen creado exitosamente desde Excel"));
    }

    @GetMapping("/type")
    @Operation(summary = "List exams por tipo", description = "Lista de exámenes filtrados por tipo")
    @ApiResponse(responseCode = "200", description = "Lista de exámenes obtenida exitosamente")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    @ApiResponse(responseCode = "404", description = "No se encontraron exámenes")
    public ResponseEntity<List<ExamListResponse>> getExamsByType(
            @RequestParam(required = false) String examType) {
        List<ExamListResponse> response = examService.getExamsByType(examType);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{examId}")
    @Operation(summary = "Obtener examen por ID", description = "Recupera un examen con sus preguntas y respuestas")
    @ApiResponse(responseCode = "200", description = "Examen recuperado exitosamente")
    @ApiResponse(responseCode = "404", description = "Examen no encontrado")
    public ResponseEntity<ExamDetailResponse> getExamById(@PathVariable Long examId) {
        ExamDetailResponse response = examService.getExamById(examId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{examId}")
    @Operation(summary = "Actualizar examen", description = "Actualiza los datos de un examen existente")
    @ApiResponse(responseCode = "200", description = "Examen actualizado exitosamente")
    @ApiResponse(responseCode = "404", description = "Examen no encontrado")
    public ResponseEntity<ExamUpdateResponse> updateExam(
            @PathVariable Long examId,
            @Valid @RequestBody ExamUpdateRequest request) {
        Long updatedExamId = examService.updateExam(examId, request);
        return ResponseEntity.ok(new ExamUpdateResponse(updatedExamId, "Examen actualizado exitosamente"));
    }

    @DeleteMapping("/{examId}")
    @Operation(summary = "Eliminar examen", description = "Marca un examen como no disponible")
    @ApiResponse(responseCode = "200", description = "Examen eliminado exitosamente")
    @ApiResponse(responseCode = "404", description = "Examen no encontrado")
    public ResponseEntity<ExamDeleteResponse> deleteExam(@PathVariable Long examId) {
        boolean deleted = examService.deleteExam(examId);
        return ResponseEntity.ok(new ExamDeleteResponse(examId, "Examen eliminado exitosamente"));
    }
}


