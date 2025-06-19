package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.time.Year;

public record HighSchoolInfoRequest(
        @NotBlank(message = "El tipo de colegio es obligatorio")
        @Schema(description = "Tipo de colegio.", example = "Público")
        String type,

        @NotBlank(message = "El nombre del colegio es obligatorio")
        @Schema(description = "Nombre del colegio.", example = "Colegio Nacional de Ciencias")
        String name,

        @NotNull(message = "El año de graduación es obligatorio")
        @Min(value = 1900, message = "El año debe ser mayor o igual a 1900")
        @Max(value = 2100, message = "El año no puede ser mayor a 2100")
        @Schema(description = "Año de graduación.", example = "2015")
        Integer graduationYear,

        @NotNull(message = "El código de ubigeo es obligatorio")
        @Schema(description = "Código de ubigeo del colegio.", example = "050101")
        UbigeoRequest ubigeo
) {}
