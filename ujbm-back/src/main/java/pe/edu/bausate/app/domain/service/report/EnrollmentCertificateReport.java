package pe.edu.bausate.app.domain.service.report;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import pe.edu.bausate.app.domain.models.Applicant;
import pe.edu.bausate.app.domain.models.Student;
import pe.edu.bausate.app.domain.report.ReportStrategyFactory;
import pe.edu.bausate.app.domain.repository.ApplicantRepository;
import pe.edu.bausate.app.domain.service.SystemParameterService;
import pe.edu.bausate.app.infraestructure.util.SystemParameterKeys;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentCertificateReport {
    private final ReportService reportService;
    private final SystemParameterService systemParameterService;

    public byte[] generateEnrollmentCertificatePdf(Student student) throws IOException {
        Map<String, Object> data = prepareCertificateData(student);
        return reportService.generateReport(ReportStrategyFactory.ReportType.PDF, "enrollment-certificate", data);
    }

    private Map<String, Object> prepareCertificateData(Student student) throws IOException {
        String universityName = systemParameterService.get(SystemParameterKeys.UNIVERSITY_NAME).toString();
        String campusName = systemParameterService.get(SystemParameterKeys.FILIAL_NAME).toString();
        String urlLogo = systemParameterService.get(SystemParameterKeys.UNIVERSITY_LOGO_PATH).toString();

        String logoPath = new ClassPathResource(urlLogo).getFile().getAbsolutePath();
        String stringLogoPath = "file:///" + logoPath.replace("\\", "/");

        Map<String, Object> data = new HashMap<>();
        data.put("recordNumber", "CI-" + student.getCode());
        data.put("logoUrl", stringLogoPath);
        data.put("universityName", universityName);
        data.put("faculty", student.getProgram().getFaculty().getName());
        data.put("academicPeriod", ""); // Completar según tu lógica
        data.put("fullName", student.getPerson().getName() + ", " + student.getPerson().getLastname());
        data.put("documentNumber", student.getPerson().getDocumentNumber());
        data.put("program", student.getProgram().getName());
        data.put("modality", student.getPerson().getEnrollmentMode().getDisplayName());
        data.put("campus", campusName);
        data.put("enrollmentDate", student.getEnrollmentDate());
        data.put("issueDate", dateFormater(LocalDate.now()));
        data.put("signatureSecretary", true);
        data.put("signatureDirector", true);
        data.put("digitalSeal", generateDigitalSeal(LocalDate.now()));

        return data;
    }

    private String dateFormater(LocalDate fecha) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return fecha.format(formatter);
    }

    private String generateDigitalSeal(LocalDate fecha) {
        return UUID.randomUUID().toString();
    }

}
