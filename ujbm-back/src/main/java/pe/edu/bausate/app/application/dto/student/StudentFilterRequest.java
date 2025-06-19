package pe.edu.bausate.app.application.dto.student;

public record StudentFilterRequest(
        String code,
        String fullName,
        String email,
        String enrollmentModeCode,
        String enrollmentModeName,
        String programId,
        String programName,
        Boolean available,
        Integer cycle,
        Integer page,
        Integer size,
        String sortBy,
        String sortDirection
) {}
