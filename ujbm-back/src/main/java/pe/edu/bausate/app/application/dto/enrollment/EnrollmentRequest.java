package pe.edu.bausate.app.application.dto.enrollment;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record EnrollmentRequest(
        @NotEmpty(message = "Debe seleccionar al menos un detalle de matrícula")
        List<Long> enrollmentDetailIds
) {}