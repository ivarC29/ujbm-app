package pe.edu.bausate.app.domain.models.projection;

import pe.edu.bausate.app.domain.enumerate.EnrollmentMode;

import java.time.LocalDate;

public interface ApplicantResumeProjection {
    Long getId();
    String getCode();
    String getFullName();
    String getDocumentNumber();
    String getProgramName();
    EnrollmentMode getEnrollmentMode();

    LocalDate getRegistryDate();
    String getAcademicPeriod();
}
