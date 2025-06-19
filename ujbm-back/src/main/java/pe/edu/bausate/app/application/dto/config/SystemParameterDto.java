package pe.edu.bausate.app.application.dto.config;

public record SystemParameterDto(
        String key,
        String value,
        String description
) {}
