package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ProgramRequest(
    @NotNull(message = "El nombre del programa no puede ser nulo")
    @Size(min = 2, max = 100, message = "El nombre del programa debe tener entre 2 y 100 caracteres")
    @Schema(description = "Nombre del programa académico", example = "Ingeniería de Software", required = true)
    String name,

    @NotNull(message = "La duración en semestres no puede ser nula")
    @Positive(message = "La duración en semestres debe ser un número positivo")
    @Schema(description = "Duración en semestres del programa", example = "8", required = true)
    Integer durationInSemesters,

    @NotNull(message = "El título otorgado no puede ser nulo")
    @Size(min = 2, max = 100, message = "El título otorgado debe tener entre 2 y 100 caracteres")
    @Schema(description = "Título otorgado al finalizar el programa", example = "Licenciado en Ingeniería de Software", required = true)
    String degreeAwarded,

    @NotNull(message = "La facultad del programa no puede ser nula")
    @Schema(description = "ID de la facultad asociada al programa", example = "1", required = true)
    Long facultyId
) {}
