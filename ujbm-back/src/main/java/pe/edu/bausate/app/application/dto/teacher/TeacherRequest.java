package pe.edu.bausate.app.application.dto.teacher;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import pe.edu.bausate.app.application.dto.PersonRequest;
import pe.edu.bausate.app.domain.models.Person;

import java.time.LocalDate;

@Schema(description = "Datos requeridos para registrar o actualizar un docente")
public record TeacherRequest(
        @Schema(description = "Título profesional del docente", example = "Ingeniero de Sistemas")
        @NotBlank(message = "El título profesional es obligatorio")
        @Size(max = 100, message = "El título profesional no debe exceder los 100 caracteres")
        String professionalTitle,

        @Schema(description = "Grado académico del docente", example = "Magíster en Ingeniería")
        @NotBlank(message = "El grado académico es obligatorio")
        @Size(max = 100, message = "El grado académico no debe exceder los 100 caracteres")
        String academicDegree,

        @Schema(description = "Fecha de contratación del docente", example = "2022-03-15")
        @NotNull(message = "La fecha de contratación es obligatoria")
        LocalDate hireDate,

        @Schema(description = "Indica si el docente es a tiempo completo", example = "true")
        @NotNull(message = "Debe indicar si es a tiempo completo o no")
        Boolean isFullTime,

        @Valid
        @NotNull(message = "Los datos de la persona son obligatorios")
        @Schema(description = "Datos de la persona")
        PersonRequest person

) {}
