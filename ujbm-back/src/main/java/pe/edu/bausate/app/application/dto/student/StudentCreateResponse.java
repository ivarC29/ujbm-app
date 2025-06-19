package pe.edu.bausate.app.application.dto.student;

public record StudentCreateResponse(
        Long studentId,
        String code,
        String fullName,
        String email,
        String message
) {}
