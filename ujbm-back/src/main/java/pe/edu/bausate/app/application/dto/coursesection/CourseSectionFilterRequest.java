package pe.edu.bausate.app.application.dto.coursesection;

public record CourseSectionFilterRequest(
        Long id,
        Long courseId,
        String courseName,
        String section,
        Long teacherId,
        String teacherName,
        Integer vacancies,
        Long periodId,
        Integer page,
        Integer size,
        String sortBy,
        String sortDirection,
        Boolean available
) {}
