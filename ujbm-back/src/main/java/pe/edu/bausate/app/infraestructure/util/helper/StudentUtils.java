package pe.edu.bausate.app.infraestructure.util.helper;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.text.RandomStringGenerator;
import pe.edu.bausate.app.application.service.email.EmailService;
import pe.edu.bausate.app.domain.models.Student;
import pe.edu.bausate.app.domain.repository.StudentRepository;
import pe.edu.bausate.app.domain.service.report.EnrollmentCertificateReport;

import java.util.HashMap;
import java.util.Map;

@Slf4j
public class StudentUtils {

    public static String generateUniqueStudentCode(StudentRepository studentRepository) {
        String numericPart = CommonUtils.generateUniqueNumericCode(7, code -> studentRepository.existsByCode("STD" + code));
        return "STD" + numericPart;
    }

    public static void sendWelcomeEmailWithCredentials(Student student, String password, EmailService emailService, EnrollmentCertificateReport enrollmentCertificateReport) {
        try {
            // Generar constancia de admisión
            byte[] certificateBytes = enrollmentCertificateReport.generateEnrollmentCertificatePdf(student);

            // Preparar datos para el correo
            Map<String, Object> variables = new HashMap<>();
            variables.put("name", student.getPerson().getName());
            variables.put("lastname", student.getPerson().getLastname());
            variables.put("username", student.getCode().toLowerCase());
            variables.put("password", password);
            variables.put("studentCode", student.getCode());
            variables.put("programName", student.getProgram().getName());
            variables.put("logoUrl", "https://bausate.edu.pe/wp-content/uploads/2021/11/cropped-Logo_ico-180x180.png");

            // Enviar correo con constancia adjunta
            emailService.sendWithAttachment(
                    "student-welcome",
                    student.getPerson().getEmail(),
                    variables,
                    "constancia_admision.pdf",
                    certificateBytes,
                    "application/pdf"
            );
        } catch (Exception e) {
            log.error("Error al enviar correo de bienvenida: {}", e.getMessage());
        }
    }

}
