package pe.edu.bausate.app.domain.service;

import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.bausate.app.application.dto.applicant.*;
import pe.edu.bausate.app.application.dto.exam.ExamAutomaticSubmissionRequest;
import pe.edu.bausate.app.domain.models.ApplicantFile;
import pe.edu.bausate.app.domain.models.Exam;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface ApplicantService {

    // Public methods
    ApplicantResponse registerApplicant(ApplicantRequest request);
    @Transactional
    ApplicantResumeResponse getApplicantResumeByDni(String dni, String paymentType);

    @Transactional
    void uploadPaymentReceipt(String dni, MultipartFile file, String paymentReceiptType) throws IOException;

    // Admin methods
    @Transactional(readOnly = true)
    Page<ApplicantTableInfoResponse> filterApplicants(ApplicantFilterRequest filterRequest);

    StudentConversionResponse convertApplicantToStudent(Long applicantId);
    void validateDocument(Long applicantId, String documentType);
    void rejectDocument(Long applicantId, String documentType);
    void uploadScores(MultipartFile file);
    ApplicantFileResponse downloadFile(Long fileId);
    void deleteFile(Long fileId);
    ApplicantScoreResponse getApplicantScoreDetails(Long applicantId);
    void updateApplicantScore(Long applicantId, Integer newScore, List<String> answers);
    List<ApplicantFile> getSyllabusFilesByApplicantId(Long applicantId);
    void rejectSyllabus(Long applicantId);

    //exam methods
    ExamAccessResponse validateExamAccess(String dni);
    ExamSubmissionResponse submitExamAnswers(String dni, ExamAutomaticSubmissionRequest request);
    List<PendingInterviewApplicantResponse> getPendingJournalismInterviews();
    ApplicantScoreResponse setPublicInterviewScore(String dni, Integer score);

    Optional<Exam> findNextAvailableExamForApplicant(Long applicantId);
    void assignNextExamToApplicant(Long applicantId);
    ApplicantScorePublicResponse getApplicantScoreByDni(String dni);

    //payment methods
    void exonerateAdmissionPayment(Long applicantId);
    void generateCollection(Long applicantId);
}
