package pe.edu.bausate.app.infraestructure.util.helper;

import pe.edu.bausate.app.application.service.email.EmailService;
import pe.edu.bausate.app.domain.enumerate.ApplicantStatus;
import pe.edu.bausate.app.domain.models.Applicant;
import pe.edu.bausate.app.domain.models.Exam;
import pe.edu.bausate.app.domain.models.Score;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class ApplicantUtils {

    public static void generateApplicantCode(Applicant applicant) {

        String periodCode = applicant.getAcademicPeriodName().replace("-", "");

        String rawCode = periodCode + applicant.getPerson().getDocumentNumber();
        String applicantCode = rawCode.length() > 10
                ? rawCode.substring(0, 10)
                : String.format("%-10s", rawCode).replace(' ', '0');

        applicant.setCode(applicantCode);
    }

    public static String generateStudentCode(Applicant applicant) {
        return applicant.getCode();
    }

    public static void validatePayment(Applicant applicant, String paymentType) {
        if (applicant.getPaymentReceiptFile1() == null
                && paymentType.equals("PAYMENT1") ) {
            throw new IllegalStateException("No se ha subido una boleta de pago para este postulante");
        }
        if (applicant.getPaymentReceiptFile2() == null
                && paymentType.equals("PAYMENT2") ) {
            throw new IllegalStateException("No se ha subido una boleta de pago para este postulante");
        }

        if (!Boolean.TRUE.equals(applicant.getDniValidated()) ||
                !Boolean.TRUE.equals(applicant.getCertificateValidated()) ||
                !Boolean.TRUE.equals(applicant.getPhotoValidated())) {
            throw new IllegalStateException("Debe validar primero DNI, certificado y foto");
        }

        if ("PAYMENT2".equals(paymentType) && !applicant.getHasPaidAdmissionFee()) {
            throw new IllegalStateException("Se debe pagar la cuota de admisión primero");
        }

        Score score = applicant.getScore();
        if ("PAYMENT2".equals(paymentType) && score == null) {
            throw new IllegalStateException("El postulante no tiene un puntaje registrado");
        }
        double minimumScore = applicant.getPerson().getEnrollmentMode().getMinimumScore();
        if ("PAYMENT2".equals(paymentType) && score.getTotalScore() < minimumScore) {
            throw new IllegalStateException("El puntaje del postulante no es suficiente para validar el pago");
        }

        if ("PAYMENT1".equals(paymentType))
            applicant.setHasPaidAdmissionFee(true);
        else if ("PAYMENT2".equals(paymentType)) {
            applicant.setIsEnrolled(true);
            applicant.setStatus(ApplicantStatus.APPROVED);
        } else {
            throw new IllegalStateException("Tipo de pago no válido");
        }

    }

    public static BigDecimal validateAmountSystemParameter(Object value) {
        if (value == null || !value.toString().matches("\\d+(\\.\\d+)?")) {
            throw new IllegalArgumentException("El valor del parámetro ADMISSION_EXAM_FEE no es un número válido: " + value);
        }
        return new BigDecimal(value.toString());
    }

    public static void sendAdmissionTestInfoEmail(Applicant applicant, EmailService emailService) {
        // This method is only called for exam programs, so we can simplify it
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", applicant.getPerson().getName());
        variables.put("programName", applicant.getProgram().getName());
        variables.put("logoUrl", "https://bausate.edu.pe/wp-content/uploads/2021/11/cropped-Logo_ico-180x180.png");
        variables.put("evaluationType", "examen de admisión");

        // Usar la información del examen asignado si existe
        Exam exam = applicant.getAssignedExam();

        if (exam != null) {
            // Formatear fecha y hora
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", new Locale("es", "ES"));
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a", new Locale("es", "ES"));

            String formattedDate = exam.getSchedule().getStartDateTime().format(dateFormatter);
            String startTime = exam.getSchedule().getStartDateTime().format(timeFormatter);
            String endTime = exam.getSchedule().getEndDateTime().format(timeFormatter);

            variables.put("examDate", formattedDate);
            variables.put("examTime", startTime + " - " + endTime);
            variables.put("examLocation", exam.getSchedule().getLocation() != null ? exam.getSchedule().getLocation() : "Campus Principal");
            variables.put("examName", exam.getName());
        } else {
            // Valores por defecto si no hay examen asignado
            variables.put("examDate", "Por confirmar");
            variables.put("examTime", "Por confirmar");
            variables.put("examLocation", "Por confirmar");
            variables.put("examName", "Examen de Admisión");
        }

        variables.put("requiredMaterials", "Documento de identidad, lápiz 2B, borrador y tajador");

        // Solo usamos la plantilla de examen
        emailService.send("exam-info", applicant.getPerson().getEmail(), variables);
    }

    public static void sendScoreApprovalEmailIfNeeded(Applicant applicant, EmailService emailService, String frontendBaseUrl) {
        if (applicant.getScore() == null || applicant.getScore().getTotalScore() == null) {
            return;
        }

        // verificar si el puntaje es suficiente para enviar el correo
        double minimumScore = applicant.getPerson().getEnrollmentMode().getMinimumScore();
        if (applicant.getScore().getTotalScore() >= minimumScore) {
            String paymentUrl = frontendBaseUrl + "/#/payment-receipt";
            Map<String, Object> variables = new HashMap<>();
            variables.put("name", applicant.getPerson().getName());
            variables.put("paymentLink", paymentUrl);
            variables.put("logoUrl", "https://bausate.edu.pe/wp-content/uploads/2021/11/cropped-Logo_ico-180x180.png");
            emailService.send("admission-approved", applicant.getPerson().getEmail(), variables);
        }
    }

}
