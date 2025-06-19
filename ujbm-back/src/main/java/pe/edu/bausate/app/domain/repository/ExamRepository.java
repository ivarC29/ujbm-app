package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.bausate.app.domain.enumerate.ExamType;
import pe.edu.bausate.app.domain.models.Exam;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    Optional<Exam> findByNameAndProgramIdAndAvailableTrue(String name, Long programId);
    List<Exam> findByProgramIdAndAvailableTrue(Long programId);
    List<Exam> findByCourseSectionIdAndAvailableTrue(Long courseSectionId);
    List<Exam> findByAcademicPeriodIdAndAvailableTrue(Long academicPeriodId);
    List<Exam> findByScheduleIdAndAvailableTrue(Long scheduleId);

    List<Exam> findByTypeAndAvailableTrue(ExamType type);
    List<Exam> findByAvailableTrue();

    @Query("""
    SELECT e FROM Exam e
    WHERE e.program.id = :programId
      AND e.type = :type
      AND e.schedule.startDateTime >= :now
      AND (e.status = pe.edu.bausate.app.domain.enumerate.ExamStatus.ACTIVE
           OR e.status = pe.edu.bausate.app.domain.enumerate.ExamStatus.PUBLISHED)
    ORDER BY e.schedule.startDateTime ASC
""")
    List<Exam> findUpcomingExamsByProgramAndType(Long programId, ExamType type, LocalDateTime now);
}