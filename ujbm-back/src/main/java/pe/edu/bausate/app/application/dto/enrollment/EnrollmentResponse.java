package pe.edu.bausate.app.application.dto.enrollment;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record EnrollmentResponse(
        Long id,
        String code,
        LocalDate enrollmentDate,
        String status,
        List<EnrollmentDetailResponse>details
) {}
