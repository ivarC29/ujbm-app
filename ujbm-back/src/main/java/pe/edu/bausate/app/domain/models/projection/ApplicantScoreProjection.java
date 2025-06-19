package pe.edu.bausate.app.domain.models.projection;

import pe.edu.bausate.app.domain.enumerate.EnrollmentMode;

import java.time.LocalDate;
import java.util.List;

public interface ApplicantScoreProjection {
    String getCode();

    String getFullName();

    LocalDate getRegistryDate();

    String getProgramName();

    Integer getTotalScore();

    String getAnswers();

    EnrollmentMode getEnrollmentMode();
}
