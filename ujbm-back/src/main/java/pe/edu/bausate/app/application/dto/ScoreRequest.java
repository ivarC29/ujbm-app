package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Representa la solicitud para actualizar el puntaje de un postulante")
public record ScoreRequest(

        @Schema(description = "Puntaje total del postulante", example = "85")
        Integer totalScore,

        @Schema(description = "Lista de respuestas del postulante", example = "[\"Respuesta 1\", \"Respuesta 2\"]")
        List<String> answers
) {}