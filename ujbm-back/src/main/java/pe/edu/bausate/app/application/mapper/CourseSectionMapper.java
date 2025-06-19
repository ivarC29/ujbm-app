package pe.edu.bausate.app.application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import pe.edu.bausate.app.application.dto.coursesection.CourseSectionRequest;
import pe.edu.bausate.app.application.dto.coursesection.CourseSectionResponse;
import pe.edu.bausate.app.application.dto.coursesection.CourseSectionTableInfoResponse;
import pe.edu.bausate.app.domain.models.CourseSection;
import pe.edu.bausate.app.domain.models.Teacher;

@Mapper(componentModel = "spring", uses = {WeeklyScheduleMapper.class, TeacherMapper.class, CourseMapper.class})
public interface CourseSectionMapper {

    @Mapping(target = "teacherId", source = "teacher.id")
    @Mapping(target = "teacherName", source = "teacher", qualifiedByName = "getTeacherFullName")
    @Mapping(target = "academicPeriodId", source = "period.id")
    @Mapping(target = "academicPeriodName", source = "period.name")
    @Mapping(target = "weeklySchedules", source = "weeklyScheduleList")
    CourseSectionResponse courseSectionToCourseSectionResponse(CourseSection courseSection);

    @Mapping(target = "course.id", source = "courseId")
    @Mapping(target = "teacher.id", source = "teacherId")
    @Mapping(target = "period.id", source = "academicPeriodId")
    @Mapping(target = "available", constant = "true")
    @Mapping(target = "weeklyScheduleList", source = "weeklySchedules")
    CourseSection courseSectionRequestToCourseSection(CourseSectionRequest courseSectionRequest);

    @Mapping(target = "courseId", source = "course.id")
    @Mapping(target = "courseName", source = "course.name")
    @Mapping(target = "section", source = "section")
    @Mapping(target = "teacherId", source = "teacher.id")
    @Mapping(target = "teacherName", source = "teacher", qualifiedByName = "getTeacherFullName")
    @Mapping(target = "vacancies", source = "vacancies")
    @Mapping(target = "periodId", source = "period.id")
    @Mapping(target = "periodName", source = "period.name")
    @Mapping(target = "weeklyScheduleList", source = "weeklyScheduleList")
    CourseSectionTableInfoResponse courseSectionToCourseSectionTableInfoResponse(CourseSection courseSection);

    @Named("getTeacherFullName")
    default String getTeacherFullName(Teacher teacher) {
        if (teacher != null && teacher.getPerson() != null) {
            return teacher.getPerson().getName() + " " + teacher.getPerson().getLastname();
        }
        return null;
    }
}
