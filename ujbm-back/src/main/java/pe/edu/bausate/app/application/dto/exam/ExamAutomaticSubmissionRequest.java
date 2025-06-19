package pe.edu.bausate.app.application.dto.exam;

import java.util.List;

public record ExamAutomaticSubmissionRequest(
    List<AnswerSubmission> answers
) {
    public record AnswerSubmission(
        Long questionId,
        List<Long> selectedAnswerIds
    ) {}
}