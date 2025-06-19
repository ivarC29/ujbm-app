package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import pe.edu.bausate.app.domain.enumerate.PeriodStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "DTO for academic period response")
public record AcademicPeriodResponse(
        @Schema(description = "Unique identifier of the academic period", example = "1")
        Long id,

        @Schema(description = "Name of the academic period", example = "2025-1")
        String name,

        @Schema(description = "Start date of the period", example = "2025-03-15")
        LocalDate startDate,

        @Schema(description = "End date of the period", example = "2025-07-20")
        LocalDate endDate,

        @Schema(description = "Current status of the period", example = "ACTIVE")
        PeriodStatus status,

        @Schema(description = "Availability status of the period", example = "true")
        Boolean available,

        @Schema(description = "Date when the period was created")
        LocalDateTime createdAt,

        @Schema(description = "Date when the period was last updated")
        LocalDateTime updatedAt
) {}
