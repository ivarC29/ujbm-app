package pe.edu.bausate.app.application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.edu.bausate.app.application.dto.teacher.TeacherCreateRequest;
import pe.edu.bausate.app.application.dto.teacher.TeacherRequest;
import pe.edu.bausate.app.application.dto.teacher.TeacherResponse;
import pe.edu.bausate.app.application.dto.teacher.TeacherTableInfoResponse;
import pe.edu.bausate.app.domain.models.Teacher;
import pe.edu.bausate.app.domain.models.projection.TeacherTableInfoProjection;

@Mapper(componentModel = "spring", uses = {PersonMapper.class})
public interface TeacherMapper {
    @Mapping(target = "person", source = "person")
    TeacherResponse teacherToTeacherResponse(Teacher teacher);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "available", ignore = true)
    @Mapping(target = "person", source = "person")
    Teacher teacherRequestToTeacher(TeacherRequest request);

    @Mapping(target = "name", source = "person.name")
    @Mapping(target = "lastname", source = "person.lastname")
    @Mapping(target = "email", source = "person.email")
    TeacherTableInfoResponse teacherToTeacherTableInfoResponse(Teacher teacher);
}
