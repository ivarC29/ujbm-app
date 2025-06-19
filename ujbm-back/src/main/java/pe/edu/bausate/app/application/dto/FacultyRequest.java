package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(name = "FacultyRequest", description = "Datos requeridos para crear o actualizar una facultad")
public record FacultyRequest(
    @NotNull(message = "El nombre de la facultad no puede ser nulo")
    @Size(min = 2, max = 100, message = "El nombre de la facultad debe tener entre 2 y 100 caracteres")
    @Schema(description = "Nombre de la facultad", example = "Facultad de Ingeniería", required = true)
    String name,

    @NotNull(message = "La descripción de la facultad no puede ser nula")
    @Size(min = 2, max = 500, message = "La descripción de la facultad debe tener entre 2 y 500 caracteres")
    @Schema(description = "Descripción de la facultad", example = "Facultad dedicada a la formación en diversas áreas de ingeniería", required = true)
    String description
) {}
