package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.bausate.app.domain.models.Faculty;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {
}
