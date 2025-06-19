package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Schema(description = "DTO for weekly schedule response")
public record WeeklyScheduleResponse(
        @Schema(description = "Unique identifier of the weekly schedule", example = "1")
        Long id,

        @Schema(description = "Day of the week for the schedule", example = "MONDAY")
        DayOfWeek day,

        @Schema(description = "Start time of the class", example = "08:00:00")
        LocalTime startTime,

        @Schema(description = "End time of the class", example = "10:00:00")
        LocalTime endTime,

        @Schema(description = "Availability status of the schedule", example = "true")
        Boolean available
) {}
