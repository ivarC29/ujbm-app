package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pe.edu.bausate.app.domain.enumerate.PersonType;
import pe.edu.bausate.app.domain.models.Person;

public interface PersonRepository extends JpaRepository<Person, Long> {

    @Modifying
    @Query("UPDATE Person p SET p.type = :type WHERE p.id = :personId")
    void updatePersonType(@Param("personId") Long personId, @Param("type") PersonType type);

}
