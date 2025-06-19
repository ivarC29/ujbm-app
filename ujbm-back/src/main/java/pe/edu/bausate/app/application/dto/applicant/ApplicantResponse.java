package pe.edu.bausate.app.application.dto.applicant;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Datos mostrar del postulante")
public record ApplicantResponse(
        @Schema(description = "Identificador del postulante.", example = "41")
        Long id,

        @Schema(description = "Codigo de postulante.", example = "0208320251")
        String code,

        @Schema(description = "Fecha de registro.", example = "02/10/2025")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
        LocalDate registryDate,

        @Schema(description = "Codigo de estado de la solicitud del postulante.", example = "01")
        String status,

        @Schema(description = "Método por el cual el postulante conoció la institución.", example = "Redes Sociales")
        String awarenessMethod,

        @Schema(description = "Indica si el DNI está validado.", example = "true")
        Boolean dniValidated,

        @Schema(description = "Indica si el certificado de estudios está validado.", example = "true")
        Boolean certificateValidated,

        @Schema(description = "Indica si la fotografía está validada.", example = "true")
        Boolean photoValidated,

        @Schema(description = "Programa al que postula")
        Long programId,

        @Schema(description = "Datos de la persona.")
        Long personId,

        @Schema(description = "Id de la Información del colegio.")
        Long highSchoolInfoId,

        @Schema(description = "Indica si el postulante ingresó a un programa.", example = "true")
        Boolean isEnrolled,

        @Schema(description = "Id del archivo del DNI.")
        Long dniFileId,

        @Schema(description = "Id del archivo del certificado de estudios.")
        Long studyCertificateFileId,

        @Schema(description = "Id del archivo de la fotografía.")
        Long photoFileId,

        @Schema(description = "Ids de los archivos syllabus.")
        List<Long> syllabusFileIds
) {}
