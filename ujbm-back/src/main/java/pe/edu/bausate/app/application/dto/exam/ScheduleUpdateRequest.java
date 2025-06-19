package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
@Schema(description = "Request DTO para actualizar un horario de examen")
public record ScheduleUpdateRequest(
        String name,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        String location
) {}
