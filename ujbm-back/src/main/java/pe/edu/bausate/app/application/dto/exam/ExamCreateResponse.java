package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response DTO para la creación de un examen")
public record ExamCreateResponse(
        @Schema(description = "id del examen creado")
        Long examId,
        @Schema(description = "Mensaje de éxito")
        String message
) {}