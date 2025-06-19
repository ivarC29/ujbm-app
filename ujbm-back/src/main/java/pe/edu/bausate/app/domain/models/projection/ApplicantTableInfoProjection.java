package pe.edu.bausate.app.domain.models.projection;

import pe.edu.bausate.app.domain.enumerate.ApplicantStatus;
import pe.edu.bausate.app.domain.enumerate.EnrollmentMode;
import pe.edu.bausate.app.domain.models.Score;

import java.time.LocalDate;
import java.util.List;

public interface ApplicantTableInfoProjection {
    Long getId(); // ID del Applicant
    String getFullName(); // Nombre completo de la persona
    EnrollmentMode getEnrollmentMode(); // DisplayName de la modalidad
    String getDocumentNumber(); // Número de documento
    Boolean getDniValidated(); // Estado de validación del DNI
    Boolean getCertificateValidated(); // Estado de validación del certificado
    Boolean getPhotoValidated(); // Estado de validación de la foto
    Boolean getEnrolled(); // Estado de inscripción
    Boolean getHasPaidAdmissionFee(); // Estado de pago de la cuota de admisión
    Long getProgramId(); // ID del programa
    String getProgramName(); // Nombre del programa
    LocalDate getRegistryDate(); // Fecha de registro
    ApplicantStatus getStatus(); // Estado del Applicant
    Long getDniFileId(); // ID del archivo DNI
    Long getStudyCertificateFileId(); // ID del certificado de estudios
    Long getPhotoFileId(); // ID de la foto
    Long getPaymentReceiptFile1Id(); // ID de la boleta de pago
    Long getPaymentReceiptFile2Id(); // ID de la boleta de pago
    Long getScoreId(); // ID de la puntuación
    Integer getTotalScore(); // Puntuación total
}
