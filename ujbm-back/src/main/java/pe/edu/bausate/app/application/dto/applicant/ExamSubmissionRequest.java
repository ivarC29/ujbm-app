package pe.edu.bausate.app.application.dto.applicant;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Schema(description = "Solicitud de envío de respuestas de examen")
public record ExamSubmissionRequest(
    @Schema(description = "Lista de respuestas del examen")
    @NotEmpty(message = "Las respuestas no pueden estar vacías")
    List<String> answers
) {}