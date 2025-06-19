package pe.edu.bausate.app.application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import pe.edu.bausate.app.application.dto.student.StudentRequest;
import pe.edu.bausate.app.application.dto.student.StudentResponse;
import pe.edu.bausate.app.application.dto.student.StudentTableInfoResponse;
import pe.edu.bausate.app.domain.enumerate.EnrollmentMode;
import pe.edu.bausate.app.domain.models.Student;

@Mapper(componentModel = "spring", uses = {PersonMapper.class, ProgramMapper.class})
public interface StudentMapper {

    @Mapping(target = "fullName", source = "person", qualifiedByName = "personToFullName")
    @Mapping(target = "email", source = "person.email")
    @Mapping(target = "programId", source = "program.id")
    @Mapping(target = "programName", source = "program.name")
    @Mapping(target = "enrollmentModeCode", source = "person.enrollmentMode", qualifiedByName = "mapEnrollmentModeToCode")
    @Mapping(target = "enrollmentModeName", source = "person.enrollmentMode", qualifiedByName = "mapEnrollmentModeToName")
    @Mapping(target = "cycle", source = "cycle")
    StudentTableInfoResponse studentToStudentTableInfoResponse(Student student);

    @Mapping(target = "programId", source = "program.id")
    @Mapping(target = "person", source = "person")
    @Mapping(target = "cycle", source = "cycle")
    StudentResponse studentToStudentResponse(Student student);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "person", ignore = true)
    @Mapping(target = "available", ignore = true)
    @Mapping(target= "cycle", ignore = true)
    Student studentRequestToStudent(StudentRequest request);

    @Named("personToFullName")
    static String personToFullName(pe.edu.bausate.app.domain.models.Person person) {
        return person.getName() + " " + person.getLastname();
    }

    @Named("mapEnrollmentModeToCode")
    default String mapEnrollmentModeToCode(EnrollmentMode mode) {
        return mode != null ? mode.getCode() : null;
    }

    @Named("mapEnrollmentModeToName")
    default String mapEnrollmentModeToName(EnrollmentMode mode) {
        return mode != null ? mode.getDisplayName() : null;
    }
}
