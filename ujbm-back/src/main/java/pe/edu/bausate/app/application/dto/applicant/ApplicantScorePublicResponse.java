package pe.edu.bausate.app.application.dto.applicant;

public record ApplicantScorePublicResponse(
    String code,
    String fullName,
    String programName,
    Integer score,
    boolean approved,
    String message
) {}