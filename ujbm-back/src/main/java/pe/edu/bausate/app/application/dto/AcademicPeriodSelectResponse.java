package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta para el select de periodos académicos")
public record AcademicPeriodSelectResponse(
        @Schema(description = "ID del periodo académico", example = "1")
        Long id,

        @Schema(description = "Nombre del periodo académico", example = "2024-1")
        String name
) {}
