package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Datos para crear una respuesta")
public record AnswerCreateRequest(

        @Schema(description = "Texto de la respuesta", example = "Lima")
        String answerText,


        @Schema(description = "Indica si la respuesta es correcta", example = "true")
        Boolean isCorrect,

        @Schema(description = "Archivo de la respuesta (opcional)")
        ExamFileRequest answerFile
) {}