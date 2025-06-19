package pe.edu.bausate.app.domain.service;

import pe.edu.bausate.app.application.dto.exam.*;

import java.util.List;

public interface ExamService {
    /**
     * Creates a new exam
     *
     * @param request The exam data
     * @return The ID of the created exam
     */
    Long createExam(ExamCreateRequest request);

    /**
     * Creates an exam from an Excel file
     *
     * @param request The request containing the Excel file and related information
     * @return The ID of the created exam
     */
    Long createExamByExcel(ExamByExcelRequest request);
    /**
     * Get a list of exams filtered by type
     *
     * @param examType Optional exam type to filter by
     * @return List of exam summary responses
     */
    List<ExamListResponse> getExamsByType(String examType);
    /**
     * Get an exam by ID
     * @param examId The ID of the exam to retrieve
     * @return The exam details
     */
    ExamDetailResponse getExamById(Long examId);

    /**
     * Update an exam
     * @param examId The ID of the exam to update
     * @param request The updated exam data
     * @return The ID of the updated exam
     */
    Long updateExam(Long examId, ExamUpdateRequest request);

    /**
     * Delete an exam (set available to false)
     * @param examId The ID of the exam to delete
     * @return true if successful
     */
    boolean deleteExam(Long examId);
}
