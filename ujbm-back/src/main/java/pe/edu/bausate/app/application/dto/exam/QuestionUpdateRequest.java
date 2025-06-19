package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Request DTO para actualizar una pregunta")
public record QuestionUpdateRequest(
        Long id,
        String questionText,
        String questionType,
        Integer position,
        Double points,
        ExamFileRequest questionFile,
        List<AnswerUpdateRequest> answers
) {}