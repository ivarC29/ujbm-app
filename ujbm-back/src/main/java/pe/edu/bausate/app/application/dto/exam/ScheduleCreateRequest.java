package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Schema(description = "Datos para programar un examen")
public record ScheduleCreateRequest(
        @Schema(description = "Nombre del horario", example = "Sesión Mañana")
        String name,

        @NotNull(message = "La fecha y hora de inicio es obligatoria")
        @Schema(description = "Fecha y hora de inicio", example = "2023-12-15T09:00:00")
        LocalDateTime startDateTime,

        @NotNull(message = "La fecha y hora de fin es obligatoria")
        @Schema(description = "Fecha y hora de fin", example = "2023-12-15T12:00:00")
        LocalDateTime endDateTime,

        @Schema(description = "Ubicación", example = "Aula Magna")
        String location,

        @NotBlank(message = "El tipo de horario es obligatorio")
        @Schema(description = "Tipo de horario (código)", example = "01")
        String scheduleType
) {}