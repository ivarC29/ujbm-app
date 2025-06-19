package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import pe.edu.bausate.app.domain.models.Person;
import pe.edu.bausate.app.domain.models.Student;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long>,
        JpaSpecificationExecutor<Student> {

    boolean existsByPerson(Person person);

    boolean existsByCode(String code);

    @Query("SELECT s.id FROM Student s WHERE s.person.id = :personId")
    Optional<Long> findIdByPersonId(Long personId);

    Optional<Student> findByCode(String code);
}
