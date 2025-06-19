package pe.edu.bausate.app.application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.edu.bausate.app.application.dto.course.CourseRequest;
import pe.edu.bausate.app.application.dto.course.CourseResponse;
import pe.edu.bausate.app.domain.models.Course;
import pe.edu.bausate.app.domain.models.Program;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    @Mapping(source = "program.id", target = "programId")
    CourseResponse courseToCourseResponse(Course course);


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "available", ignore = true)
    @Mapping(target = "program", source = "programId")
    Course courseRequestToCourse(CourseRequest courseRequest);

    default Program map(Long programId) {
        if (programId == null) return null;
        Program program = new Program();
        program.setId(programId);
        return program;
    }
}
