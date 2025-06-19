package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "FacultyResponse", description = "Respuesta con los datos de una facultad")
public record FacultyResponse(
        @Schema(description = "ID de la facultad", example = "1", required = true)
        Long id,

        @Schema(description = "Nombre de la facultad", example = "Facultad de Ingeniería", required = true)
        String name,

        @Schema(description = "Descripción de la facultad", example = "Facultad dedicada a la formación en diversas áreas de ingeniería", required = true)
        String description
) {}
