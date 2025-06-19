package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response DTO para archivos de examen")
public record ExamFileResponse(
    Long id,
    String fileName,
    String fileType,
    String fileCategory,
    String data
) {}