package pe.edu.bausate.app.application.dto.applicant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "FileRequest", description = "Datos requeridos para crear o actualizar un archivo")
public record ApplicantFileRequest(
        @Schema(description = "Nombre del archivo", example = "documento.pdf", required = true)
        String fileName,

        @Schema(description = "Tipo de archivo", example = "application/pdf", required = true)
        String fileType,

        @Schema(description = "Contenido del archivo en formato de bytes", required = true)
        byte[] data
) {}
