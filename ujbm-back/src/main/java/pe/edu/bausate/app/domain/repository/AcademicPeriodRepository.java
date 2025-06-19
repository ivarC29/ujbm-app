package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.bausate.app.domain.models.AcademicPeriod;
import pe.edu.bausate.app.domain.models.projection.AcademicPeriodProjection;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AcademicPeriodRepository extends JpaRepository<AcademicPeriod, Long> {
    @Query("""
        SELECT a.id AS id, a.name AS name
        FROM AcademicPeriod a
        WHERE a.available = true
          AND a.status = '01'
          AND CURRENT_DATE BETWEEN a.startDate AND a.endDate
    """)
    Optional<AcademicPeriodProjection> findCurrentAcademicPeriod();

    @Query("""
        SELECT a.id AS id, a.name AS name
        FROM AcademicPeriod a
        WHERE a.available = true
            AND :date BETWEEN a.startDate AND a.endDate
    """)
    Optional<AcademicPeriodProjection> findAcademicPeriodByDate(@Param("date") LocalDate date);

    @Query("SELECT a.id FROM AcademicPeriod a WHERE a.available = true")
    List<Long> findAllValidIds();

    @Query("""
        SELECT a.id AS id, a.name AS name
        FROM AcademicPeriod a
        WHERE a.available = true
          AND a.status <> '02'
        ORDER BY a.startDate DESC
    """)
    List<AcademicPeriodProjection> findAllByOrderByStartDateDescAvailable();
}
