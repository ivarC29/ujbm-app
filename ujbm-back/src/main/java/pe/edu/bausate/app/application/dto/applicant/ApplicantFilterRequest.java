package pe.edu.bausate.app.application.dto.applicant;

import java.time.LocalDate;

public record ApplicantFilterRequest(
        String fullName,
        String code,
        String documentNumber,
        Long programId,
        String statusCode,
        String enrollmentModeCode,
        LocalDate registryDate,
        Boolean enrolled,
        Boolean available,

        Integer page,
        Integer size,
        String sortBy,
        String sortDirection
) {}
