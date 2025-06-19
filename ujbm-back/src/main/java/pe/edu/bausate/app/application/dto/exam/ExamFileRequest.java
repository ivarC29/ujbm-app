package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Datos para un archivo de examen")
public record ExamFileRequest(
        @NotBlank(message = "El nombre del archivo es obligatorio")
        @Schema(description = "Nombre del archivo", example = "examen.pdf")
        String fileName,

        @NotBlank(message = "El tipo de archivo es obligatorio")
        @Schema(description = "Tipo de archivo", example = "application/pdf")
        String fileType,

        @NotNull(message = "Los datos del archivo son obligatorios")
        @Schema(description = "Contenido del archivo en formato de bytes")
        byte[] data
) {}