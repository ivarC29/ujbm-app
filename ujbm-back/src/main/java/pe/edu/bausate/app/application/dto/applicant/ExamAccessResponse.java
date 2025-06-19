package pe.edu.bausate.app.application.dto.applicant;

import io.swagger.v3.oas.annotations.media.Schema;
import pe.edu.bausate.app.application.dto.exam.ExamDetailResponse;

@Schema(description = "Respuesta de validación para acceso al examen")
public record ExamAccessResponse(
    @Schema(description = "Identificador del postulante", example = "12345")
    Long applicantId,

    @Schema(description = "Código del postulante", example = "AP202305001")
    String code,

    @Schema(description = "Nombre completo del postulante", example = "Juan Pérez")
    String fullName,

    @Schema(description = "Nombre del programa al que postula", example = "Ingeniería de Sistemas")
    String programName,

    @Schema(description = "Indica si el postulante puede acceder al examen", example = "true")
    Boolean canAccessExam,

    @Schema(description = "Mensaje informativo", example = "El postulante puede acceder al examen")
    String message,

    @Schema(description = "Información completa del examen incluyendo preguntas y respuestas")
    ExamDetailResponse exam
) {}