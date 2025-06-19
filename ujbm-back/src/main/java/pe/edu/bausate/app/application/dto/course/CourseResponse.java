package pe.edu.bausate.app.application.dto.course;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Datos del curso")
public record CourseResponse(
        @Schema(description = "ID del curso", example = "1")
        Long id,

        @Schema(description = "Código del curso", example = "MAT101")
        String code,

        @Schema(description = "Nombre del curso", example = "Matemática I")
        String name,

        @Schema(description = "Créditos del curso", example = "4")
        Integer credits,

        @Schema(description = "Ciclo del curso", example = "1")
        Integer cycle,

        @Schema(description = "ID del programa", example = "2")
        Long programId
) {}
