package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record HighSchoolInfoResponse(
        @Schema(description = "Identificador del colegio.", example = "1")
        Long id,

        @Schema(description = "Tipo de colegio.", example = "Público")
        String type,

        @Schema(description = "Nombre del colegio.", example = "Colegio Nacional de Ciencias")
        String name,

        @Schema(description = "Año de graduación.", example = "2015")
        Integer graduationYear,

        @Schema(description = "Ubigeo del colegio.", example = "050101")
        UbigeoResponse ubigeo
) {}
