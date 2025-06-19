package pe.edu.bausate.app.domain.models.projection;

import java.util.List;

public interface CourseSectionTableInfoProjection {
    Long getId();

    Long getCourseId();

    String getCourseName();

    String getSection();

    Long getTeacherId();

    String getTeacherName();

    Integer getVacancies();

    Long getPeriodId();

    String getPeriodName();

    List<WeeklyScheduleProjection> getWeeklyScheduleList();
}
