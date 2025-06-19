package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.bausate.app.domain.models.InterviewerAvailability;
import pe.edu.bausate.app.domain.models.auth.User;

import java.util.List;
import java.util.Optional;

public interface InterviewerAvailabilityRepository extends JpaRepository<InterviewerAvailability, Long> {
    List<InterviewerAvailability> findAllByAvailableTrue();
    List<InterviewerAvailability> findAllByInterviewerId(Long interviewerId);
    @Query("SELECT i.interviewer FROM InterviewerAvailability i WHERE i.interviewer.id = :interviewerId AND i.available = true GROUP BY i.interviewer")
    Optional<User> findInterviewerById(@Param("interviewerId") Long interviewerId);
}