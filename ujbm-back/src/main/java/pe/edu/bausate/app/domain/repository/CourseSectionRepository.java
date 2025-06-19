package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.bausate.app.domain.models.CourseSection;

import java.util.List;

public interface CourseSectionRepository extends JpaRepository<CourseSection, Long>,
        JpaSpecificationExecutor<CourseSection>{

    boolean existsCourseSectionBySection(String section);

    @Query("SELECT cs FROM CourseSection cs WHERE cs.teacher.id = :teacherId AND cs.period.id = :periodId AND cs.available = true")
    List<CourseSection> findByTeacherIdAndPeriodIdAndAvailable(@Param("teacherId") Long teacherId, @Param("periodId") Long periodId);

    @Query("SELECT cs FROM CourseSection cs " +
            "JOIN EnrollmentDetail ed ON ed.courseSection.id = cs.id " +
            "JOIN Enrollment e ON e.id = ed.enrollment.id " +
            "WHERE e.student.id = :studentId AND cs.period.id = :periodId AND cs.available = true")
    List<CourseSection> findByStudentIdAndPeriodIdAndAvailable(@Param("studentId") Long studentId, @Param("periodId") Long periodId);

    @Query("SELECT cs FROM CourseSection cs " +
            "WHERE cs.course.program.id = :programId " +
            "AND cs.course.cycle = :cycle " +
            "AND cs.period.id = :periodId " +
            "AND cs.available = true")
    List<CourseSection> findByProgramIdAndCycleAndPeriodIdAndAvailableIsTrue(
            @Param("programId") Long programId,
            @Param("cycle") Integer cycle,
            @Param("periodId") Long periodId);


}
