package pe.edu.bausate.app.application.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.bausate.app.domain.report.ReportStrategyFactory;
import pe.edu.bausate.app.domain.service.report.EnrollmentCertificateReport;
import pe.edu.bausate.app.domain.service.report.ReportService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.REPORT)
public class ReportController {
    private final EnrollmentCertificateReport enrollmentCertificateReport;


    @GetMapping("/ingreso/{id}")
    public ResponseEntity<byte[]> generateEnrollmentCertificate(@PathVariable Long id) throws IOException {

        return ResponseEntity.notFound().build();
//        byte[] pdfData = enrollmentCertificateReport.generateEnrollmentCertificatePdf(id);

//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_PDF);
//        headers.setContentDispositionFormData("filename", "constancia-ingreso-" + id + ".pdf");

//        return new ResponseEntity<>(pdfData, headers, HttpStatus.OK);
    }

}
