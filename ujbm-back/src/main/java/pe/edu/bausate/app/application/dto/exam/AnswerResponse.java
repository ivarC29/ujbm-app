package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response DTO para respuestas de preguntas")
public record AnswerResponse(
    Long id,
    String answerText,
    Boolean isCorrect,
    ExamFileResponse answerFile
) {}
