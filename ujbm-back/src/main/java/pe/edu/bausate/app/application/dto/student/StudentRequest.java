package pe.edu.bausate.app.application.dto.student;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import pe.edu.bausate.app.application.dto.PersonRequest;

import java.time.LocalDate;

public record StudentRequest(
        @Schema(description = "Fecha de matrícula", example = "2024-03-01")
        @NotNull(message = "La fecha de matrícula es obligatoria")
        LocalDate enrollmentDate,

        @Schema(description = "ID del programa académico", example = "10")
        @NotNull(message = "El programa es obligatorio")
        Long programId,

        @Schema(description = "Ciclo del estudiante", example = "1")
        @NotNull(message = "El ciclo es obligatorio")
        Integer cycle,

        @Schema(description = "Datos de la persona asociada")
        PersonRequest person
) {}
