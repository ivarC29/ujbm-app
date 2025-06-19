package pe.edu.bausate.app.application.dto.course;

public record CourseFilterRequest(
        String code,
        String name,
        Integer credits,
        Integer cycle,
        Long programId,
        Integer page,
        Integer size,
        String sortBy,
        String sortDirection,
        Boolean available
) {}
