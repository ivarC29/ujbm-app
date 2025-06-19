package pe.edu.bausate.app.application.dto.enrollment;

import lombok.Builder;
import pe.edu.bausate.app.domain.enumerate.EnrollmentDetailStatus;

@Builder
public record EnrollmentDetailResponse(
    Long id,
    Long courseSectionId,
    String courseCode,
    String courseName,
    String section,
    Integer credits,
    EnrollmentDetailStatus status
) {}
