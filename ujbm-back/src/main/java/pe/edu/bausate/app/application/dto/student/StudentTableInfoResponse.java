package pe.edu.bausate.app.application.dto.student;

public record StudentTableInfoResponse(
    Long id,
    String code,
    String fullName,
    String email,
    String enrollmentModeCode,
    String enrollmentModeName,
    Long programId,
    String programName,
    Integer cycle,
    Boolean available
) {}
