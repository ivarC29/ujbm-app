package pe.edu.bausate.app.application.dto.course;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Datos para crear o actualizar un curso")
public record CourseRequest(
        @NotBlank
        @Schema(description = "Código del curso", example = "MAT101")
        String code,

        @NotBlank
        @Schema(description = "Nombre del curso", example = "Matemática I")
        String name,

        @NotNull @Min(1)
        @Schema(description = "Créditos del curso", example = "4")
        Integer credits,

        @NotNull @Min(1)
        @Schema(description = "Ciclo del curso", example = "1")
        Integer cycle,

        @NotNull
        @Schema(description = "ID del programa", example = "2")
        Long programId
) {}
