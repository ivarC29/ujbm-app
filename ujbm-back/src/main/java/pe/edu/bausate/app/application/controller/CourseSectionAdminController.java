package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.bausate.app.application.dto.applicant.ApplicantTableInfoResponse;
import pe.edu.bausate.app.application.dto.coursesection.*;
import pe.edu.bausate.app.domain.models.CourseSection;
import pe.edu.bausate.app.domain.service.CourseSectionService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.COURSE_SECTION_ADMIN)
@RequiredArgsConstructor
@Tag(name = "CourseSection", description = "Operaciones relacionadas a las ofertas de cursos")
public class CourseSectionAdminController {

    private final CourseSectionService courseSectionService;

    @Operation(summary = "Listar secciones disponibles",
            description = "Retorna una lista paginada secciones.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de secciones obtenida correctamente"),
            @ApiResponse(responseCode = "400", description = "Parámetros inválidos"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping("/table-filter")
    public ResponseEntity<Page<CourseSectionTableInfoResponse>> listAvailable(
            @RequestBody CourseSectionFilterRequest filterRequest) {

        return ResponseEntity.ok(this.courseSectionService.filterCourseSections(filterRequest));
    }

    @PostMapping
    @Operation(summary = "Crear una nueva sección de curso",
            description = "Crea una nueva sección de curso con la información proporcionada")
    @ApiResponse(responseCode = "201", description = "Sección de curso creada exitosamente")
    public ResponseEntity<CourseSectionResponse> create(@Valid @RequestBody CourseSectionRequest request) {
        CourseSectionResponse response = courseSectionService.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una sección de curso por ID")
    public ResponseEntity<CourseSectionResponse> findById(@PathVariable Long id) {
        return courseSectionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una sección de curso")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        courseSectionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una sección de curso",
            description = "Actualiza una sección de curso existente con la información proporcionada")
    @ApiResponse(responseCode = "200", description = "Sección de curso actualizada exitosamente")
    public ResponseEntity<CourseSectionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CourseSectionRequest request) {
        CourseSectionResponse response = courseSectionService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @SneakyThrows
    @PostMapping(value = "/batch-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Carga masiva de secciones de curso desde Excel",
            description = """
            Permite subir un archivo Excel con información para crear múltiples secciones de curso.
            Formato esperado del archivo:
            | CursoID | Sección | ProfesorID | Vacantes | PeriodoID | Día | HoraInicio | HoraFin |
            Ejemplo de fila: 1 | A | 10 | 30 | 13 | MONDAY | 08:00 | 10:00
            """
    )
    @ApiResponse(responseCode = "200", description = "Archivo procesado correctamente")
    public ResponseEntity<CourseSectionBatchUploadResponse> batchUpload(@RequestParam("file") MultipartFile file) {
        CourseSectionBatchUploadResponse response = courseSectionService.batchUpload(file);
        return ResponseEntity.ok(response);
    }

}
