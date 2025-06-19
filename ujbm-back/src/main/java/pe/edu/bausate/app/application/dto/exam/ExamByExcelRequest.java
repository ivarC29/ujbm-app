package pe.edu.bausate.app.application.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Datos para crear un examen desde Excel")
public record ExamByExcelRequest(
    @NotNull(message = "El archivo Excel es obligatorio")
    @Schema(description = "Archivo Excel con los datos del examen")
    ExamFileRequest file,

    @NotNull(message = "El ID del programa es obligatorio")
    @Schema(description = "ID del programa académico", example = "1")
    Long programId,

    @Schema(description = "ID de la sección del curso (opcional)", example = "2")
    Long courseSectionId,

    @Schema(description = "ID del periodo académico", example = "3")
    Long academicPeriodId,

    @NotBlank(message = "El tipo de examen es obligatorio")
    @Schema(description = "Tipo de examen (código)", example = "06")
    String examType,

    @Schema(description = "Puntaje mínimo para aprobar", example = "60")
    Double passingScore,

    @Schema(description = "Cantidad de intentos permitidos", example = "2")
    Integer attemptsAllowed,

    @Schema(description = "Indica si las preguntas deben mezclarse", example = "true")
    Boolean shuffleQuestions,

    @Schema(description = "Archivo principal del examen (opcional)")
    ExamFileRequest examFile,

    @Valid
    @Schema(description = "Datos de programación del examen")
    ScheduleCreateRequest schedule
) {}