package pe.edu.bausate.app.application.dto.teacher;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.edu.bausate.app.application.dto.PersonRequest;

import java.time.LocalDate;

@Schema(description = "Datos para crear un docente")
public record TeacherCreateRequest(
        @Valid
        @NotNull(message = "Los datos de la persona son obligatorios")
        @Schema(description = "Datos de la persona")
        PersonRequest person,

        @NotBlank(message = "El título profesional es obligatorio")
        @Schema(description = "Título profesional del docente", example = "Ingeniero de Sistemas")
        String professionalTitle,

        @NotBlank(message = "El grado académico es obligatorio")
        @Schema(description = "Grado académico del docente", example = "Magíster")
        String academicDegree,

        @Schema(description = "Fecha de contratación del docente", example = "2022-03-15")
        @NotNull(message = "La fecha de contratación es obligatoria")
        LocalDate hireDate,

        @Schema(description = "Indica si es docente a tiempo completo", example = "true")
        Boolean isFullTime
) {}
