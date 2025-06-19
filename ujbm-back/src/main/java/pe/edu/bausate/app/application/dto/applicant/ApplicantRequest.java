package pe.edu.bausate.app.application.dto.applicant;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import pe.edu.bausate.app.application.dto.HighSchoolInfoRequest;
import pe.edu.bausate.app.application.dto.PersonRequest;

import java.util.List;

import java.time.LocalDate;

@Schema(description = "Datos para crear postulante")
public record ApplicantRequest(

        @Schema(description = "Fecha de registro.", example = "02/10/2025")
        LocalDate registryDate,

        @Schema(description = "Codigo de estado de la solicitud del postulante.", example = "01")
        String status,

        @NotNull(message = "El método de conocimiento es obligatorio")
        @Schema(description = "Codigo del método por el cual el postulante conoció la institución.", example = "01")
        String awarenessMethod,

        @NotNull(message = "El ID del programa es obligatorio")
        @Schema(description = "Id de la carrera", example = "38")
        Long programId,

        @Valid
        @Schema(description = "Datos de la persona.")
        PersonRequest person,

        @Valid
        @NotNull(message = "La información del colegio es obligatoria")
        @Schema(description = "Información del colegio.")
        HighSchoolInfoRequest highSchoolInfo,

        @Valid
        @NotNull(message = "El archivo del DNI es obligatorio")
        @Schema(description = "Archivo del documento de identidad.")
        ApplicantFileRequest dniFile,

        @Valid
        @NotNull(message = "El archivo del certificado de estudios es obligatorio")
        @Schema(description = "Archivo del certificado de estudios.")
        ApplicantFileRequest studyCertificateFile,

        @Valid
        @NotNull(message = "El archivo de la fotografía es obligatorio")
        @Schema(description = "Archivo de la fotografía.")
        ApplicantFileRequest photoFile,

        @Valid
        @Schema(description = "Archivos de los sílabos.")
        List<ApplicantFileRequest> syllabusFiles
) {}
