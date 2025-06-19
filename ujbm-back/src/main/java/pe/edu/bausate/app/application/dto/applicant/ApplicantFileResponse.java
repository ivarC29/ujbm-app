package pe.edu.bausate.app.application.dto.applicant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "FileResponse", description = "Datos de archivos.")
public record ApplicantFileResponse(

        @Schema(description = "Id del archivo", example = "43")
        Long id,

        @Schema(description = "Nombre del archivo", example = "documento.pdf")
        String fileName,

        @Schema(description = "Extension del archivo.", example = "application/pdf")
        String fileType,

        @Schema(description = "Contenido del archivo en formato de bytes")
        byte[] data
) {}
