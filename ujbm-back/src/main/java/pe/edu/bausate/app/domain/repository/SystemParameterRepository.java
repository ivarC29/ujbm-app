package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.bausate.app.domain.models.SystemParameter;

import java.util.List;
import java.util.Optional;

public interface SystemParameterRepository extends JpaRepository<SystemParameter, Long> {
    Optional<SystemParameter> findByKeyAndAvailableTrue(String key);
    boolean existsByKey(String key);
    List<SystemParameter> findAllByAvailableTrue();
}
