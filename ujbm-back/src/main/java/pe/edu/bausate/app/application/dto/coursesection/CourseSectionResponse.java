package pe.edu.bausate.app.application.dto.coursesection;

import io.swagger.v3.oas.annotations.media.Schema;
import pe.edu.bausate.app.application.dto.WeeklyScheduleResponse;
import pe.edu.bausate.app.application.dto.course.CourseResponse;

import java.util.List;

@Schema(description = "DTO for course section response")
public record CourseSectionResponse(
        @Schema(description = "Unique identifier of the course section", example = "1")
        Long id,

        @Schema(description = "Course information")
        CourseResponse course,

        @Schema(description = "Section name or code", example = "A")
        String section,

        @Schema(description = "Teacher identifier", example = "5")
        Long teacherId,

        @Schema(description = "Teacher information")
        String teacherName,

        @Schema(description = "Number of available vacancies", example = "30")
        Integer vacancies,

        @Schema(description = "Academic period identifier", example = "2")
        Long academicPeriodId,

        @Schema(description = "Academic period information")
        String academicPeriodName,

        @Schema(description = "List of weekly schedules for this section")
        List<WeeklyScheduleResponse> weeklySchedules

) {}
