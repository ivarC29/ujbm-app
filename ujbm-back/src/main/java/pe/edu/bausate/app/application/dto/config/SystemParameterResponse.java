package pe.edu.bausate.app.application.dto.config;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta para los parámetros del sistema")
public record SystemParameterResponse(
    @Schema(description = "Clave del parámetro del sistema", example = "app.name")
    String key,

    @Schema(description = "Valor del parámetro del sistema", example = "Bausate App")
    String value,

    @Schema(description = "Descripción del parámetro del sistema", example = "Nombre de la aplicación")
    String description,

    @Schema(description = "Tipo de dato del parámetro del sistema", example = "STRING")
    String dataType,

    @Schema(description = "Indica si el parámetro es editable", example = "true")
    Boolean editable
    )
{}
