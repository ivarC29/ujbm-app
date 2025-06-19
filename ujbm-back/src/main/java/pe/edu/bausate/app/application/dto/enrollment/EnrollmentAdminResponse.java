package pe.edu.bausate.app.application.dto.enrollment;

import lombok.Builder;
import pe.edu.bausate.app.domain.enumerate.EnrollmentStatus;

import java.time.LocalDate;

@Builder
public record EnrollmentAdminResponse(
        Long id,
        String studentCode,
        String studentName,
        Long programId,
        String programName,
        LocalDate enrollmentDate,
        EnrollmentStatus status,
        Long academicPeriodId,
        String academicPeriodName,
        Integer totalCourses
) {}