package pe.edu.bausate.app.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WeeklyScheduleRequest(
        @NotBlank(message = "El día es obligatorio")
        String day,
        @NotBlank(message = "La hora de inicio es obligatoria")
        String startTime,
        @NotBlank(message = "La hora de fin es obligatoria")
        String endTime
) {}
