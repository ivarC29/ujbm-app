package pe.edu.bausate.app.application.dto.applicant;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ApplicantResumeResponse(
        Long id,
        String code,
        String fullName,
        String documentNumber,
        String programName,
        String enrollmentModeName,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
        LocalDate registryDate,
        String academicPeriodName,
        BigDecimal amount
) {}
