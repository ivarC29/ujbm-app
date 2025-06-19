package pe.edu.bausate.app.application.dto.enrollment;

import lombok.Builder;
import pe.edu.bausate.app.domain.enumerate.EnrollmentStatus;

import java.time.LocalDate;
import java.util.List;

@Builder
public record EnrollmentDetailsWithScheduleResponse(
    Long id,
    LocalDate enrollmentDate,
    EnrollmentStatus status,
    Long studentId,
    String studentCode,
    String studentName,
    Long programId,
    String programName,
    Long academicPeriodId,
    String academicPeriodName,
    List<EnrollmentDetailWithScheduleResponse> details
) {}
