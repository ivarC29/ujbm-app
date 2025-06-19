package pe.edu.bausate.app.application.dto.coursesection;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import pe.edu.bausate.app.application.dto.WeeklyScheduleRequest;

import java.util.List;

@Schema(description = "DTO for creating or updating a course section")
public record CourseSectionRequest(
        @Schema(description = "ID of the course", example = "1")
        @NotNull(message = "Course ID is required")
        @Positive(message = "Course ID must be a positive number")
        Long courseId,

        @Schema(description = "Section name or code", example = "A")
        @NotBlank(message = "Section name is required")
        String section,

        @Schema(description = "ID of the teacher", example = "1")
        @NotNull(message = "Teacher ID is required")
        @Positive(message = "Teacher ID must be a positive number")
        Long teacherId,

        @Schema(description = "Number of available vacancies", example = "30")
        @NotNull(message = "Vacancies is required")
        @Positive(message = "Vacancies must be a positive number")
        Integer vacancies,

        @Schema(description = "ID of the academic period", example = "1")
        @NotNull(message = "Academic period ID is required")
        @Positive(message = "Academic period ID must be a positive number")
        Long academicPeriodId,

        @Schema(description = "List of weekly schedules")
        @NotNull(message = "Weekly schedules are required")
        List<WeeklyScheduleRequest> weeklySchedules
) {}
