package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.bausate.app.domain.models.Appointment;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    @Query("SELECT a FROM Appointment a WHERE a.interviewer.id = :interviewerId AND a.schedule.startDateTime BETWEEN :startDate AND :endDate AND a.available = true")
    List<Appointment> findByInterviewerAndDateRange(@Param("interviewerId") Long interviewerId,
                                                    @Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.schedule.startDateTime BETWEEN :startDate AND :endDate AND a.available = true")
    int countAppointmentsByDateRange(@Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);

    List<Appointment> findByApplicantId(Long applicantId);
}