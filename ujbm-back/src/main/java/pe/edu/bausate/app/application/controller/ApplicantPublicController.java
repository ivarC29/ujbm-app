package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.bausate.app.application.dto.applicant.*;
import pe.edu.bausate.app.application.dto.exam.ExamAutomaticSubmissionRequest;
import pe.edu.bausate.app.domain.service.ApplicantService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(ApiPaths.APPLICANT_PUBLIC)
@RequiredArgsConstructor
@Tag(name = "Applicants", description = "Operaciones publicas relacionadas a los postulantes")
public class ApplicantPublicController {
    private final ApplicantService applicantService;

    @Operation(summary = "Registrar un postulante con documentos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Postulante creado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping()
    public ResponseEntity<ApplicantResponse> registerApplicant(
            @Valid @RequestBody @Parameter(description = "Datos del postulante") ApplicantRequest request
    ) {
        ApplicantResponse response = applicantService.registerApplicant(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Obtener datos basicos del postulante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Datos obtenidos correctamente"),
            @ApiResponse(responseCode = "404", description = "Postulante no encontrado")
    })
    @GetMapping("/{dni}/resume")
    public ResponseEntity<ApplicantResumeResponse> getApplicantResumeByDni(@PathVariable String dni, @RequestParam String paymentType) {
        return ResponseEntity.ok(applicantService.getApplicantResumeByDni(dni, paymentType));
    }

    @PostMapping("/{dni}/upload-payment")
    public ResponseEntity<String> uploadPaymentReceipt(@PathVariable String dni,
                                                       @RequestParam("file") MultipartFile file,
                                                       @RequestParam String paymentType) throws IOException {
        applicantService.uploadPaymentReceipt(dni, file, paymentType);
        return ResponseEntity.ok("Boleta de pago subida exitosamente");
    }

    //Exam endpoints
    @Operation(summary = "Validar acceso al examen de admisión")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Validación exitosa"),
            @ApiResponse(responseCode = "404", description = "Postulante no encontrado")
    })
    @GetMapping("/{dni}/validate-exam-access")
    public ResponseEntity<ExamAccessResponse> validateExamAccess(@PathVariable String dni) {
        return ResponseEntity.ok(applicantService.validateExamAccess(dni));
    }

    @Operation(summary = "Enviar respuestas del examen de admisión")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Respuestas enviadas correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "404", description = "Postulante no encontrado")
    })
    @PostMapping("/{dni}/submit-exam")
    public ResponseEntity<ExamSubmissionResponse> submitExam(
            @PathVariable String dni,
            @Valid @RequestBody ExamAutomaticSubmissionRequest request) {
        return ResponseEntity.ok(applicantService.submitExamAnswers(dni, request));
    }
    //TODO BORRAR METODOS YA NO USADOS
    @Operation(summary = "Listar postulantes pendientes para entrevista de periodismo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    })
    @GetMapping("/pending-interviews/journalism")
    public ResponseEntity<List<PendingInterviewApplicantResponse>> getPendingJournalismInterviews() {
        return ResponseEntity.ok(applicantService.getPendingJournalismInterviews());
    }

    @Operation(summary = "Establecer puntuación de entrevista para un postulante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Puntuación establecida correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "404", description = "Postulante no encontrado")
    })
    @PostMapping("/{dni}/interview-score")
    public ResponseEntity<ApplicantScoreResponse> setInterviewScore(
            @PathVariable String dni,
            @Valid @RequestBody InterviewScoreRequest request) {
        return ResponseEntity.ok(applicantService.setPublicInterviewScore(dni, request.score()));
    }

    @GetMapping("/score/{dni}")
    public ResponseEntity<ApplicantScorePublicResponse> getScoreByDni(@PathVariable String dni) {
        ApplicantScorePublicResponse response = applicantService.getApplicantScoreByDni(dni);
        return ResponseEntity.ok(response);
    }

}
