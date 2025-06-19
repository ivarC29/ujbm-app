package pe.edu.bausate.app.application.dto.teacher;

public record TeacherTableInfoResponse(
        Long id,
        String code,
        String name,
        String lastname,
        String email,
        String professionalTitle,
        String academicDegree
) {}
