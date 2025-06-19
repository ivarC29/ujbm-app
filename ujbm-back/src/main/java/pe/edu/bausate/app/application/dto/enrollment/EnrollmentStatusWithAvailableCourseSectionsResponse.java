package pe.edu.bausate.app.application.dto.enrollment;

import pe.edu.bausate.app.application.dto.coursesection.CourseSectionWithDetailStatusResponse;
import pe.edu.bausate.app.domain.enumerate.EnrollmentStatus;

import java.util.List;

public record EnrollmentStatusWithAvailableCourseSectionsResponse(
        EnrollmentStatus enrollmentStatus,
        Long enrollmentId,
        String studentName,
        String studentLastName,
        Integer studentCycle,
        String academicPeriodName,
        Long academicPeriodId,
        List<CourseSectionWithDetailStatusResponse> availableSections
) {}