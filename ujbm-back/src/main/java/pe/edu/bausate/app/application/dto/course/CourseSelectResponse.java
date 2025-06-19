package pe.edu.bausate.app.application.dto.course;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta para el select de cursos")
public record CourseSelectResponse(
        @Schema(description = "ID del curso", example = "1")
        Long id,
        @Schema(description = "Nombre del curso", example = "Matemática I")
        String name
) {}
