package pe.edu.bausate.app.application.dto.coursesection;

import pe.edu.bausate.app.domain.enumerate.EnrollmentStatus;
import pe.edu.bausate.app.domain.enumerate.EnrollmentDetailStatus;

public record CourseSectionWithDetailStatusResponse(
        CourseSectionResponse courseSection,
        EnrollmentDetailStatus enrollmentDetailStatus,
        Long enrollmentDetailId
) {}