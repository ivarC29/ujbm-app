package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.bausate.app.domain.models.Schedule;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    @Query("SELECT s FROM Schedule s WHERE s.startDateTime >= :minStartTime AND s.available = true")
    List<Schedule> findAvailableSchedulesAfter(@Param("minStartTime") LocalDateTime minStartTime);

    @Query("SELECT s FROM Schedule s WHERE s.type = pe.edu.bausate.app.domain.enumerate.ScheduleType.INTERVIEW " +
            "AND s.startDateTime BETWEEN :startDate AND :endDate AND s.available = true")
    List<Schedule> findAvailableInterviewSchedules(@Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
    //
}
