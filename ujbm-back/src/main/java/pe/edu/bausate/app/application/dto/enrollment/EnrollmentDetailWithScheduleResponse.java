package pe.edu.bausate.app.application.dto.enrollment;

import lombok.Builder;
import pe.edu.bausate.app.application.dto.WeeklyScheduleResponse;
import pe.edu.bausate.app.domain.enumerate.EnrollmentDetailStatus;

import java.util.List;

@Builder
public record EnrollmentDetailWithScheduleResponse(
    Long id,
    Long courseSectionId,
    String courseCode,
    String courseName,
    String section,
    Integer credits,
    EnrollmentDetailStatus status,
    String teacherName,
    List<WeeklyScheduleResponse> schedules
) {}