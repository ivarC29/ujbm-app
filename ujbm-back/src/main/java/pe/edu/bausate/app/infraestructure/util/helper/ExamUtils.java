package pe.edu.bausate.app.infraestructure.util.helper;

import pe.edu.bausate.app.domain.enumerate.QuestionType;
import pe.edu.bausate.app.domain.models.Answer;
import pe.edu.bausate.app.domain.models.Question;
import pe.edu.bausate.app.domain.repository.AnswerRepository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ExamUtils {

    public static double gradeAutomaticExam(List<Question> questions, Map<Long, List<Long>> applicantAnswers, AnswerRepository answerRepository) {
        double totalScore = 0.0;

        for (Question question : questions) {
            List<Answer> correctAnswers = answerRepository.findByQuestionIdAndAvailableTrue(question.getId())
                .stream()
                .filter(Answer::getIsCorrect)
                .collect(Collectors.toList());

            List<Long> correctAnswerIds = correctAnswers.stream()
                .map(Answer::getId)
                .collect(Collectors.toList());

            List<Long> selectedAnswerIds = applicantAnswers.getOrDefault(question.getId(), List.of());

            if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
                long correctSelected = selectedAnswerIds.stream().filter(correctAnswerIds::contains).count();
                long incorrectSelected = selectedAnswerIds.size() - correctSelected;
                double questionScore = question.getPoints().doubleValue() *
                    Math.max(0, ((double) correctSelected / correctAnswerIds.size()) - ((double) incorrectSelected / correctAnswerIds.size()));
                totalScore += questionScore;
            } else if (question.getType() == QuestionType.TRUE_FALSE) {
                if (!correctAnswerIds.isEmpty() && !selectedAnswerIds.isEmpty() && correctAnswerIds.get(0).equals(selectedAnswerIds.get(0))) {
                    totalScore += question.getPoints().doubleValue();
                }
            }
        }
        return totalScore;
    }
}