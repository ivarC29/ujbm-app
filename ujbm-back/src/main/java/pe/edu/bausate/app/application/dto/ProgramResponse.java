package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record ProgramResponse(
        @Schema(description = "ID del programa", example = "1", required = true)
        Long id,

        @Schema(description = "Nombre del programa académico", example = "Ingeniería de Software", required = true)
        String name,

        @Schema(description = "Duración en semestres del programa", example = "8", required = true)
        Integer durationInSemesters,

        @Schema(description = "Título otorgado al finalizar el programa", example = "Licenciado en Ingeniería de Software", required = true)
        String degreeAwarded,

        @Schema(description = "ID de la facultad asociada al programa", example = "1", required = true)
        Long facultyId,

        @Schema(description = "Nombre de la facultad asociada al programa", example = "Facultad de Ingeniería", required = true)
        String facultyName
) {}
