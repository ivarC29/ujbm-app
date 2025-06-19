package pe.edu.bausate.app.application.dto.applicant;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

public record ApplicantTableInfoResponse(
        Long id,
        String fullName,
        String code,
        String enrollmentModeCode,
        String enrollmentModeName,
        String documentNumber,
        Boolean enrolled,
        Boolean hasPaidAdmissionFee,
        Boolean dniValidated,
        Boolean certificateValidated,
        Boolean photoValidated,
        Long programId,
        String programName,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
        LocalDate registryDate,
        String statusCode,
        String statusName,
        Long dniFileId,
        Long studyCertificateFileId,
        Long photoFileId,
        Long paymentReceiptFile1Id,
        Long paymentReceiptFile2Id,
        Long scoreId,
        Integer totalScore,
        Boolean isApproved
) {}
