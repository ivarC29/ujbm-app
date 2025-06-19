package pe.edu.bausate.app.application.dto.teacher;

public record TeacherFilterRequest(
        String fullName,
        String email,
        String code,
        String professionalTitle,
        String academicDegree,
        Boolean available,
        Integer page,
        Integer size,
        String sortBy,
        String sortDirection
) {}
