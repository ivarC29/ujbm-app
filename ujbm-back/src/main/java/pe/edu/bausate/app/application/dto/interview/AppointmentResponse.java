package pe.edu.bausate.app.application.dto.interview;

import java.time.LocalDateTime;

public record AppointmentResponse(
    Long id,
    Long scheduleId,
    LocalDateTime startTime,
    LocalDateTime endTime,
    Long applicantId,
    String applicantCode,
    String applicantName,
    Long interviewerId,
    String interviewerName,
    String status,
    String notes
) {}