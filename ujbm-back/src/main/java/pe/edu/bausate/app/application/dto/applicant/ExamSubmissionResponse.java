package pe.edu.bausate.app.application.dto.applicant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta del envío de examen")
public record ExamSubmissionResponse(
    @Schema(description = "Identificador del postulante", example = "12345")
    Long applicantId,

    @Schema(description = "Código del postulante", example = "AP202305001")
    String code,

    @Schema(description = "Nombre completo del postulante", example = "Juan Pérez")
    String fullName,

//    @Schema(description = "Puntaje obtenido", example = "25")
//    Integer score,
//
//    @Schema(description = "Indica si el postulante aprobó el examen", example = "true")
//    Boolean isApproved,

    @Schema(description = "Mensaje informativo", example = "Examen enviado correctamente")
    String message
) {}