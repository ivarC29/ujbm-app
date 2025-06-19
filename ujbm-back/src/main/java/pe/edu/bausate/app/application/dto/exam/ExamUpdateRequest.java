package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Request DTO para actualizar un examen")
public record ExamUpdateRequest(
        String name,
        String description,
        Long programId,
        Long courseSectionId,
        Long academicPeriodId,
        String status,
        Double maxScore,
        Integer durationMinutes,
        Double passingScore,
        Integer attemptsAllowed,
        Boolean shuffleQuestions,
        ScheduleUpdateRequest schedule,
        ExamFileRequest examFile,
        List<QuestionUpdateRequest> questions
) {}