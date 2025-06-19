package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.bausate.app.application.dto.coursesection.CourseSectionResponse;
import pe.edu.bausate.app.domain.models.Teacher;
import pe.edu.bausate.app.domain.service.CourseSectionService;
import pe.edu.bausate.app.domain.service.TeacherService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;
import pe.edu.bausate.app.infraestructure.exception.NotFoundException;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.COURSE_SECTION_TEACHER)
@RequiredArgsConstructor
public class CourseSectionTeacherController {

    private final CourseSectionService courseSectionService;
    private final TeacherService teacherService;

    @GetMapping("/my-courses")
    @Operation(summary = "Obtener cursos asignados al profesor en el período actual",
            description = "Retorna la lista de secciones de curso que el profesor está impartiendo en el período académico actual")
    @SecurityRequirement(name = "bearer-key")
    public ResponseEntity<List<CourseSectionResponse>> getMyCourseSections(Authentication authentication) {
        String username = authentication.getName(); // Obtiene el nombre de usuario

        Teacher teacher = teacherService.findByCode(username.toUpperCase())
                .orElseThrow(() -> new NotFoundException("Profesor no encontrado con el código: " + username));

        List<CourseSectionResponse> courses = courseSectionService.findCurrentCourseSectionsByTeacherId(teacher.getId());
        return ResponseEntity.ok(courses);
    }

}
