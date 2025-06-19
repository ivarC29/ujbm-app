package pe.edu.bausate.app.application.dto.student;

import io.swagger.v3.oas.annotations.media.Schema;
import pe.edu.bausate.app.application.dto.PersonResponse;

import java.time.LocalDate;

public record StudentResponse(
        @Schema(description = "Identificador del estudiante", example = "1")
        Long id,

        @Schema(description = "Código del estudiante", example = "20240001")
        String code,

        @Schema(description = "Fecha de matrícula", example = "2024-03-01")
        LocalDate enrollmentDate,

        @Schema(description = "Ciclo del estudiante", example = "1")
        Integer cycle,

        @Schema(description = "ID del programa académico", example = "10")
        Long programId,

        @Schema(description = "Datos de la persona asociada")
        PersonResponse person
) {}
