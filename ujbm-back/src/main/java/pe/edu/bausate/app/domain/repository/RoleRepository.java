package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.bausate.app.domain.models.auth.Role;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);

    Optional<Role> findOptionalByName(String name);

}
