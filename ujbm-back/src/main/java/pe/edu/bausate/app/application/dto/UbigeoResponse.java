package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record UbigeoResponse(
        @Schema(description = "Identificador del ubigeo.", example = "1")
        Long id,

        @Schema(description = "Código del departamento.", example = "01")
        String departmentCode,

        @Schema(description = "Código de la provincia.", example = "02")
        String provinceCode,

        @Schema(description = "Código del distrito.", example = "03")
        String districtCode,

        @Schema(description = "Nombre del departamento.", example = "Cusco")
        String departmentName,

        @Schema(description = "Nombre de la provincia.", example = "Urubamba")
        String provinceName,

        @Schema(description = "Nombre del distrito.", example = "Machu Picchu")
        String districtName,

        @Schema(description = "País.", example = "Perú")
        String country,

        @Schema(description = "Código RENIEC.", example = "050101")
        String reniecCode,

        @Schema(description = "Disponibilidad del ubigeo.", example = "true")
        Boolean available
) {}
