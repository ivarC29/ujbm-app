package pe.edu.bausate.app.application.dto.applicant;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Solicitud para establecer puntuación de entrevista")
public record InterviewScoreRequest(
    @Schema(description = "Puntuación total de la entrevista", example = "85")
    @NotNull(message = "La puntuación no puede ser nula")
    @Min(value = 0, message = "La puntuación mínima es 0")
    @Max(value = 100, message = "La puntuación máxima es 100")
    Integer score
) {}