package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "listado de exámenes")
public record ExamListResponse(
        Long id,
        String name,
        String description,
        String program,
        String courseSection,
        String academicPeriod,
        String type,
        String status,
        String maxScore,
        Integer totalQuestions,
        Integer durationMinutes,
        String scheduledDate,
        String passingScore,
        Integer attemptsAllowed,
        Boolean shuffleQuestions
) {}