package pe.edu.bausate.app.application.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.bausate.app.application.dto.coursesection.CourseSectionResponse;
import pe.edu.bausate.app.domain.models.auth.User;
import pe.edu.bausate.app.domain.service.CourseSectionService;
import pe.edu.bausate.app.domain.service.StudentService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;
import pe.edu.bausate.app.infraestructure.exception.NotFoundException;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.COURSE_SECTION_STUDENT)
@RequiredArgsConstructor
@Tag(name = "CourseSection", description = "Operaciones relacionadas a los cursos asignados a los estudiantes")
public class CourseSectionStudentController {

    private final CourseSectionService courseSectionService;
    private final StudentService studentService;

    @GetMapping("/my-courses")
    @Operation(summary = "Obtener cursos asignados al estudiante en el período actual",
            description = "Retorna la lista de secciones de curso en las que el estudiante está matriculado para el período académico actual")
    @SecurityRequirement(name = "bearer-key")
    public ResponseEntity<List<CourseSectionResponse>> getMyCourseSections(Authentication authentication) {
        String username = authentication.getName(); // Obtiene el nombre de usuario
        Long studentId = studentService.findByCode(username.toUpperCase())
                .orElseThrow(() -> new NotFoundException("Estudiante no encontrado con el código: " + username))
                .getId();
        List<CourseSectionResponse> courses = courseSectionService.findCurrentCourseSectionsByStudentId(studentId);
        return ResponseEntity.ok(courses);
    }


}
