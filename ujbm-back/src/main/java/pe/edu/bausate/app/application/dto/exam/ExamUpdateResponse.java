package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response DTO para actualizar un examen")
public record ExamUpdateResponse(
        Long id,
        String message
) {}