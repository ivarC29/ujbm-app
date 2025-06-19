package pe.edu.bausate.app.domain.service;

import org.springframework.data.domain.Page;
import pe.edu.bausate.app.application.dto.coursesection.CourseSectionWithDetailStatusResponse;
import pe.edu.bausate.app.application.dto.enrollment.*;
import pe.edu.bausate.app.domain.models.Student;

import java.util.List;
import java.util.Optional;

public interface EnrollmentService {
    void generatePreEnrollment(Student student);
    List<EnrollmentResponse> findEnrollmentsByStudentId(Long studentId);
    Optional<EnrollmentResponse> findEnrollmentById(Long enrollmentId, Long studentId);

    EnrollmentStatusWithAvailableCourseSectionsResponse getAvailableCourseSectionsForStudent(Long studentId, CourseSectionService courseSectionService);
    EnrollmentResponse submitEnrollment(Long studentId, EnrollmentRequest request);
    Page<EnrollmentAdminResponse> filterEnrollments(EnrollmentFilterRequest filterRequest);
    EnrollmentDetailsResponse getEnrollmentDetailsById(Long enrollmentId);
    EnrollmentDetailsResponse confirmEnrollment(Long enrollmentId);
    EnrollmentDetailsResponse rejectEnrollment(Long enrollmentId);
    EnrollmentDetailsResponse getStudentConfirmedEnrollment(Long studentId);
    EnrollmentDetailsWithScheduleResponse getStudentConfirmedEnrollmentWithSchedules(Long studentId);
}
