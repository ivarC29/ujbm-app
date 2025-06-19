package pe.edu.bausate.app.application.dto.applicant;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Datos del puntaje y respuestas del postulante")
public record ApplicantScoreResponse(
        @Schema(description = "Código del postulante", example = "0208320251")
        String code,

        @Schema(description = "Nombre completo del postulante", example = "Juan Pérez")
        String fullName,

        @Schema(description = "Nombre del periodo académico en curso", example = "2025-I")
        String academicPeriodName,

        @Schema(description = "Carrera a la que postula", example = "Ingeniería de Sistemas")
        String programName,

        @Schema(description = "Puntaje total obtenido", example = "85")
        Integer totalScore,

        @Schema(description = "Respuestas del postulante", example = "A;B;C;D")
        List<String> answers,

        @Schema(description = "Indica si el postulante está aprobado", example = "true")
        Boolean isApproved
)
{}
