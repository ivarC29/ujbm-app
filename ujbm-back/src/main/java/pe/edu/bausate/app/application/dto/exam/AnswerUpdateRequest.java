package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request DTO para actualizar una respuesta")
public record AnswerUpdateRequest(
        Long id,
        String answerText,
        Boolean isCorrect,
        ExamFileRequest answerFile
) {}