package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UbigeoRequest(
        @NotBlank(message = "El código de departamento es obligatorio")
        @Size(max = 2, message = "El código de departamento debe tener máximo 2 caracteres")
        @Schema(description = "Código del departamento.", example = "01")
        String departmentCode,

        @NotBlank(message = "El código de provincia es obligatorio")
        @Size(max = 2, message = "El código de provincia debe tener máximo 2 caracteres")
        @Schema(description = "Código de la provincia.", example = "02")
        String provinceCode,

        @NotBlank(message = "El código de distrito es obligatorio")
        @Size(max = 2, message = "El código de distrito debe tener máximo 2 caracteres")
        @Schema(description = "Código del distrito.", example = "03")
        String districtCode
) {}
