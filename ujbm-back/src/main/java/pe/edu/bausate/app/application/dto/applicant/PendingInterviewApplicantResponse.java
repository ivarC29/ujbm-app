package pe.edu.bausate.app.application.dto.applicant;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Respuesta para postulante pendiente de entrevista")
public record PendingInterviewApplicantResponse(
    @Schema(description = "Identificador del postulante", example = "12345")
    Long id,

    @Schema(description = "Código del postulante", example = "AP202305001")
    String code,

    @Schema(description = "Nombre completo del postulante", example = "Juan Pérez")
    String fullName,

    @Schema(description = "Número de documento", example = "12345678")
    String documentNumber,

    @Schema(description = "Fecha de registro", example = "2023-05-01")
    LocalDate registryDate,

    @Schema(description = "Nombre del programa", example = "Periodismo")
    String programName,

    @Schema(description = "Correo electrónico", example = "juan.perez@example.com")
    String email,

    @Schema(description = "Teléfono", example = "987654321")
    String phone
) {}
