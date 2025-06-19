package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Response DTO para detalles de un examen")
public record ExamDetailResponse(
    Long id,
    String name,
    String description,
    Long programId,
    String programName,
    Long courseSectionId,
    String courseSectionName,
    Long academicPeriodId,
    String academicPeriodName,
    String examType,
    String status,
    Double maxScore,
    Integer totalQuestions,
    Integer durationMinutes,
    Double passingScore,
    Integer attemptsAllowed,
    Boolean shuffleQuestions,
    ScheduleResponse schedule,
    ExamFileResponse examFile,
    List<QuestionResponse> questions
) {}
