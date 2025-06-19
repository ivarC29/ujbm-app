package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;


import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pe.edu.bausate.app.application.dto.course.CourseFilterRequest;
import pe.edu.bausate.app.application.dto.course.CourseRequest;
import pe.edu.bausate.app.application.dto.course.CourseResponse;
import pe.edu.bausate.app.application.dto.course.CourseSelectResponse;
import pe.edu.bausate.app.domain.service.CourseService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(ApiPaths.COURSE_ADMIN)
@Tag(name = "Cursos", description = "Operaciones para la gestión de cursos")
public class CourseAdminController {

    private final CourseService courseService;

    public CourseAdminController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo curso")
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CourseRequest request) {
        CourseResponse createdCourse = courseService.createCourse(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdCourse.id())
                .toUri();

        return ResponseEntity.created(location).body(createdCourse);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de cursos disponibles obtenida correctamente"),
            @ApiResponse(responseCode = "400", description = "Parámetros inválidos"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping("/table-filter")
    @Operation(summary = "Listar cursos disponibles con filtros")
    public ResponseEntity<Page<CourseResponse>> listAvailableFiltered(
            @RequestBody CourseFilterRequest filterRequest) {
        return ResponseEntity.ok(this.courseService.filterCourses(filterRequest));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un curso por ID")
    public ResponseEntity<CourseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un curso existente")
    public ResponseEntity<CourseResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar (deshabilitar) un curso")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/select")
    @Operation(summary = "Listar cursos para select", description = "Retorna una lista de cursos con id y nombre para select.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de cursos obtenida correctamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<List<CourseSelectResponse>> listForSelect() {
        return ResponseEntity.ok(courseService.getAllForSelect());
    }

    @GetMapping("/select/by-program-and-cycle")
    @Operation(summary = "Listar cursos por programa y ciclo para select", description = "Retorna una lista de cursos filtrados por programa y ciclo.")
    public ResponseEntity<List<CourseSelectResponse>> listForSelectByProgramAndCycle(
            @RequestParam Long programId,
            @RequestParam Integer cycle) {
        return ResponseEntity.ok(courseService.getAllForSelectByProgramAndCycle(programId, cycle));
    }

}
