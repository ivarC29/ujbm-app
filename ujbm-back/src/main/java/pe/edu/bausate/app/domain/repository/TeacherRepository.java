package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import pe.edu.bausate.app.domain.models.Teacher;


import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends
        JpaRepository<Teacher, Long>,
        JpaSpecificationExecutor<Teacher> {

    boolean existsByCode(String code);
    Optional<Teacher> findByCode(String code);

    @Query("SELECT t.id FROM Teacher t WHERE t.person.id = :personId")
    Optional<Long> findIdByPersonId(Long personId);

    @Query("SELECT t.id FROM Teacher t WHERE t.available = true")
    List<Long> findAllValidIds();

    @Query("SELECT t FROM Teacher t WHERE t.available = true AND LOWER(CONCAT(t.person.name, ' ', t.person.lastname)) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Teacher> findAvailableByFullNameContaining(String query);

}
