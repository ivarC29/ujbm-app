package pe.edu.bausate.app.application.dto.interview;

import java.time.LocalDateTime;

public record AppointmentUpdateRequest(
    Long scheduleId,
    Long interviewerId,
    String statusCode,
    String notes,
    // New fields for direct schedule modification
    String scheduleName,
    LocalDateTime startDateTime,
    LocalDateTime endDateTime,
    String location
) {}