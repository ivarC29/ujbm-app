package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Response DTO para preguntas de examen")
public record QuestionResponse(
    Long id,
    String questionText,
    String questionType,
    Integer position,
    Double points,
    ExamFileResponse questionFile,
    List<AnswerResponse> answers
) {}