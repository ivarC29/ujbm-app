package pe.edu.bausate.app.application.dto.coursesection;

import pe.edu.bausate.app.application.dto.WeeklyScheduleResponse;

import java.util.List;

public record CourseSectionTableInfoResponse(

        Long id,
        Long courseId,
        String courseName,
        String section,
        Long teacherId,
        String teacherName,
        Integer vacancies,
        Long periodId,
        String periodName,
        List<WeeklyScheduleResponse> weeklyScheduleList
) {}
