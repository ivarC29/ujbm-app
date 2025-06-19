package pe.edu.bausate.app.application.dto.enrollment;

import io.swagger.v3.oas.annotations.media.Schema;
import pe.edu.bausate.app.domain.enumerate.EnrollmentStatus;

import java.time.LocalDate;

@Schema(description = "Parametros de filtro para la lista de matrículas")
public record EnrollmentFilterRequest(
    @Schema(description = "Status de la matrícula")
    EnrollmentStatus status,

    @Schema(description = "Código del estado de matrícula para filtrar")
    String statusCode,

    @Schema(description = "Student name filter (partial match)")
    String studentName,

    @Schema(description = "Codigo del estudiante para filtrar)")
    String studentCode,

    @Schema(description = "Periodo académico ID para filtrar")
    Long academicPeriodId,

    @Schema(description = "Programa ID para filtrar")
    Long programId,

    @Schema(description = "Fecha de matrícula para filtrar")
    LocalDate enrollmentDate,

    @Schema(description = "Page number (0-based)", defaultValue = "0")
    Integer page,

    @Schema(description = "Page size", defaultValue = "10")
    Integer size,

    @Schema(description = "Sort field", defaultValue = "enrollmentDate")
    String sortBy,

    @Schema(description = "Sort direction (ASC or DESC)", defaultValue = "DESC")
    String sortDirection
) {}
