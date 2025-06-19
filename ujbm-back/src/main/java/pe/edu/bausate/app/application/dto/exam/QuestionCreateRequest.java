package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

@Schema(description = "Datos para crear una pregunta de examen")
public record QuestionCreateRequest(
        @NotBlank(message = "El texto de la pregunta es obligatorio")
        @Schema(description = "Texto de la pregunta", example = "¿Cuál es la capital de Perú?")
        String questionText,

        @NotBlank(message = "El tipo de pregunta es obligatorio")
        @Schema(description = "Tipo de pregunta (código)", example = "01")
        String questionType,

        @NotNull(message = "La posición es obligatoria")
        @Schema(description = "Posición de la pregunta en el examen", example = "1")
        Integer position,

        @Positive(message = "Los puntos deben ser mayor a 0")
        @Schema(description = "Puntos que vale la pregunta", example = "5")
        Double points,

        @Schema(description = "Archivo de la pregunta (opcional)")
        ExamFileRequest questionFile,

        @Schema(description = "Respuestas posibles")
        List<@Valid AnswerCreateRequest> answers
) {}