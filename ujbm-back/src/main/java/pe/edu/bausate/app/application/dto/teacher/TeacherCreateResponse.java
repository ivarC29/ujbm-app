package pe.edu.bausate.app.application.dto.teacher;

public record TeacherCreateResponse(
        Long teacherId,
        String code,
        String fullName,
        String email,
        String message
) {}
