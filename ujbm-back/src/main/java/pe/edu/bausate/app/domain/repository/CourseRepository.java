package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.bausate.app.domain.models.Course;
import pe.edu.bausate.app.domain.models.projection.CourseSelectProjection;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

    @Query("SELECT c FROM Course c WHERE c.program.id = :programId AND c.cycle = 1")
    List<Course> findFirstCycleCoursesByProgram(@Param("programId") Long programId);

    boolean existsByCode(String code);

    @Query("SELECT c.id FROM Course c WHERE c.available = true")
    List<Long> findAllValidIds();

    List<CourseSelectProjection> findAllByAvailableTrueOrderByNameAsc();

    @Query("SELECT c FROM Course c WHERE c.available = true AND c.program.id = :programId AND c.cycle = :cycle ORDER BY c.name ASC")
    List<Course> findAllByProgramIdAndCycleAndAvailableTrueOrderByNameAsc(@Param("programId") Long programId, @Param("cycle") Integer cycle);
}
