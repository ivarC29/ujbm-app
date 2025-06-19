package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.edu.bausate.app.domain.models.Program;
import pe.edu.bausate.app.domain.models.projection.ProgramSelectProjection;

import java.util.List;

public interface ProgramRepository extends JpaRepository<Program, Long> {

    @Query(value = "SELECT id, name FROM program", nativeQuery = true)
    List<ProgramSelectProjection> findOnlyIdAndName();
}
