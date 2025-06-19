package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.bausate.app.domain.enumerate.EnrollmentDetailStatus;
import pe.edu.bausate.app.domain.models.EnrollmentDetail;

import java.util.List;

public interface EnrollmentDetailRepository extends JpaRepository<EnrollmentDetail, Long> {

    @Query("SELECT DISTINCT ed.courseSection.course.id FROM EnrollmentDetail ed " +
            "WHERE ed.enrollment.student.id = :studentId " +
            "AND ed.status = :status " +
            "AND ed.available = true")
    List<Long> findCourseIdsByStudentIdAndStatus(@Param("studentId") Long studentId,
                                                 @Param("status") EnrollmentDetailStatus status);
}
