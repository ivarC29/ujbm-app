package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

@Schema(description = "Datos para crear un examen")
public record ExamCreateRequest(
        @NotBlank(message = "El nombre del examen es obligatorio")
        @Schema(description = "Nombre del examen", example = "Examen Parcial de Comunicación")
        String name,

        @Schema(description = "Descripción del examen", example = "Evaluación de conceptos básicos de comunicación")
        String description,

        @NotNull(message = "El ID del programa es obligatorio")
        @Schema(description = "ID del programa académico", example = "1")
        Long programId,

        @Schema(description = "ID de la sección del curso", example = "2")
        Long courseSectionId,

        @Schema(description = "ID del periodo académico", example = "3")
        Long academicPeriodId,

        @NotBlank(message = "El tipo de examen es obligatorio")
        @Schema(description = "Tipo de examen (código)", example = "06")
        String examType,

        @Positive(message = "El puntaje máximo debe ser mayor a 0")
        @Schema(description = "Puntaje máximo del examen", example = "100")
        Double maxScore,

        @Positive(message = "El puntaje aprobatorio debe ser mayor a 0")
        @Schema(description = "Puntaje mínimo para aprobar", example = "60")
        Double passingScore,

        @Positive(message = "La duración debe ser mayor a 0")
        @Schema(description = "Duración en minutos", example = "90")
        Integer durationMinutes,

        @Schema(description = "Cantidad de intentos permitidos", example = "2")
        Integer attemptsAllowed,

        @Schema(description = "Indica si las preguntas deben mezclarse", example = "true")
        Boolean shuffleQuestions,

        @Schema(description = "Archivo principal del examen (opcional)")
        ExamFileRequest examFile,

        @Valid
        @Schema(description = "Datos de programación del examen")
        ScheduleCreateRequest schedule,

        @Valid
        @Schema(description = "Preguntas del examen")
        List<QuestionCreateRequest> questions
) {}
