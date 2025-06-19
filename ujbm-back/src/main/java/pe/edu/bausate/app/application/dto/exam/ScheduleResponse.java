package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Response DTO para información de horario de examen")
public record ScheduleResponse(
    Long id,
    String name,
    LocalDateTime startDateTime,
    LocalDateTime endDateTime,
    String location,
    String scheduleType
) {}
