package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.bausate.app.application.dto.applicant.*;
import pe.edu.bausate.app.application.dto.ScoreRequest;
import pe.edu.bausate.app.domain.models.Applicant;
import pe.edu.bausate.app.domain.models.ApplicantFile;
import pe.edu.bausate.app.domain.models.Student;
import pe.edu.bausate.app.domain.service.ApplicantService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping(ApiPaths.APPLICANT_ADMIN)
@RequiredArgsConstructor
@Tag(name = "Applicants", description = "Operaciones de administracion relacionadas a los postulantes")
public class ApplicantAdminController {
    private final ApplicantService applicantService;

    @Operation(summary = "Listar postulantes disponibles",
            description = "Retorna una lista paginada de postulantes disponibles para asignación.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de postulantes disponible obtenida correctamente"),
            @ApiResponse(responseCode = "400", description = "Parámetros inválidos"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping("/table-filter")
    public ResponseEntity<Page<ApplicantTableInfoResponse>> filterApplicants(
            @RequestBody ApplicantFilterRequest filterRequest) {

        return ResponseEntity.ok(this.applicantService.filterApplicants(filterRequest));
    }

    @PostMapping("/{id}/validate-document")
    public ResponseEntity<Void> validateDocument(
            @PathVariable Long id,
            @RequestParam String documentType) {

        applicantService.validateDocument(id, documentType.toUpperCase());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject-document")
    public ResponseEntity<Void> rejectDocument(
            @PathVariable Long id,
            @RequestParam String documentType) {

        applicantService.rejectDocument(id, documentType);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/enroll/{id}")
    @Operation(summary = "Cambiar el postulante a estudiante.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estudiante generado correctamente."),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    public ResponseEntity<StudentConversionResponse> convertToStudent(@PathVariable Long id) {
        return ResponseEntity.ok(applicantService.convertApplicantToStudent(id));
    }

    @GetMapping("/files/{fileId}")
    public ResponseEntity<ApplicantFileResponse> downloadFile(@PathVariable Long fileId) {
        ApplicantFileResponse applicantFileResponse = applicantService.downloadFile(fileId);
        return ResponseEntity.ok(applicantFileResponse);
    }

    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<String> deleteFile(@PathVariable Long fileId) {
        applicantService.deleteFile(fileId);
        return ResponseEntity.ok("Archivo eliminado correctamente");
    }

    @PostMapping("/upload-scores")
    public ResponseEntity<String> uploadScores(@RequestParam("file") MultipartFile file) {
        applicantService.uploadScores(file);
        return ResponseEntity.ok("Archivo procesado correctamente");
    }

    @Operation(summary = "Obtener puntaje y respuestas del postulante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Datos obtenidos correctamente"),
            @ApiResponse(responseCode = "404", description = "Postulante no encontrado")
    })
    @GetMapping("/{id}/score-details")
    public ResponseEntity<ApplicantScoreResponse> getApplicantScoreDetails(@PathVariable Long id) {
        return ResponseEntity.ok(applicantService.getApplicantScoreDetails(id));
    }

    @PatchMapping("/{id}/update-score")
    @Operation(summary = "Actualizar manualmente el puntaje de un postulante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Puntaje actualizado correctamente"),
            @ApiResponse(responseCode = "404", description = "Postulante no encontrado")
    })
    public ResponseEntity<String> updateApplicantScore(
            @PathVariable Long id,
            @Valid @RequestBody @Parameter(description = "Datos del puntaje") ScoreRequest scoreRequest) {
        System.out.println("ApplicantId: " + id);
        System.out.println("ScoreRequest: " + scoreRequest);
        applicantService.updateApplicantScore(id, scoreRequest.totalScore(), scoreRequest.answers());
        return ResponseEntity.ok("Puntaje actualizado correctamente");
    }

    @GetMapping("/{id}/download-syllabus")
    public ResponseEntity<byte[]> downloadAllSyllabus(@PathVariable Long id) throws IOException {
        List<ApplicantFile> syllabusFiles = applicantService.getSyllabusFilesByApplicantId(id);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            for (ApplicantFile file : syllabusFiles) {
                ZipEntry entry = new ZipEntry(file.getFileName());
                zos.putNextEntry(entry);
                zos.write(file.getData());
                zos.closeEntry();
            }
        }
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=syllabus_files.zip")
                .body(baos.toByteArray());
    }

    @PostMapping("/{id}/reject-syllabus")
    public ResponseEntity<Void> rejectSyllabus(@PathVariable Long id) {
        applicantService.rejectSyllabus(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/exonerate-payment")
    public ResponseEntity<Void> exonerateAdmissionPayment(@PathVariable Long id) {
        applicantService.exonerateAdmissionPayment(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/generate-collection")
    public ResponseEntity<Void> generateCollection(@PathVariable Long id) {
        applicantService.generateCollection(id);
        return ResponseEntity.ok().build();
    }

}
