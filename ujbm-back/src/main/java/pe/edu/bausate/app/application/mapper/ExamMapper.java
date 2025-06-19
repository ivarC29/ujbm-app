package pe.edu.bausate.app.application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import pe.edu.bausate.app.application.dto.exam.*;
import pe.edu.bausate.app.domain.enumerate.ExamFileType;
import pe.edu.bausate.app.domain.enumerate.ExamStatus;
import pe.edu.bausate.app.domain.enumerate.ExamType;
import pe.edu.bausate.app.domain.enumerate.ScheduleType;
import pe.edu.bausate.app.domain.enumerate.QuestionType;
import pe.edu.bausate.app.domain.models.*;
import pe.edu.bausate.app.domain.repository.AnswerRepository;
import pe.edu.bausate.app.domain.repository.ExamFileRepository;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;



@Mapper(componentModel = "spring", imports = {BigDecimal.class, ExamStatus.class, ExamType.class, QuestionType.class, ScheduleType.class, ExamFileType.class, Base64.class})
public interface ExamMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "available", constant = "true")
    @Mapping(target = "status", expression = "java(ExamStatus.DRAFT)")
    @Mapping(target = "type", expression = "java(ExamType.valueOf(request.examType()))")
    @Mapping(target = "program", source = "programId", qualifiedByName = "programIdToProgram")
    @Mapping(target = "courseSection", source = "courseSectionId", qualifiedByName = "courseSectionIdToCourseSection")
    @Mapping(target = "academicPeriod", source = "academicPeriodId", qualifiedByName = "academicPeriodIdToAcademicPeriod")
    @Mapping(target = "maxScore", source = "maxScore", qualifiedByName = "doubleToDecimal")
    @Mapping(target = "passingScore", source = "passingScore", qualifiedByName = "doubleToDecimal")
    @Mapping(target = "totalQuestions", expression = "java(request.questions() != null ? request.questions().size() : 0)")
    Exam examCreateRequestToExam(ExamCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "available", constant = "true")
    @Mapping(target = "type", expression = "java(ScheduleType.valueOf(request.scheduleType()))")
    Schedule scheduleCreateRequestToSchedule(ScheduleCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "available", constant = "true")
    @Mapping(target = "type", expression = "java(QuestionType.valueOf(request.questionType()))")
    @Mapping(target = "points", source = "points", qualifiedByName = "doubleToDecimal")
    Question questionCreateRequestToQuestion(QuestionCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "available", constant = "true")
    Answer answerCreateRequestToAnswer(AnswerCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "available", constant = "true")
    @Mapping(target = "exam", ignore = true)
    @Mapping(target = "fileCategory", expression = "java(ExamFileType.EXAM_CONTENT)")
    ExamFile examFileRequestToExamFile(ExamFileRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "available", constant = "true")
    @Mapping(target = "exam", ignore = true)
    @Mapping(target = "fileCategory", expression = "java(ExamFileType.QUESTION_CONTENT)")
    ExamFile questionFileRequestToExamFile(ExamFileRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "available", constant = "true")
    @Mapping(target = "exam", ignore = true)
    @Mapping(target = "fileCategory", expression = "java(ExamFileType.ANSWER_CONTENT)")
    ExamFile answerFileRequestToExamFile(ExamFileRequest request);

    @Named("doubleToDecimal")
    default BigDecimal doubleToDecimal(Double value) {
        return value != null ? BigDecimal.valueOf(value) : null;
    }

    @Named("programIdToProgram")
    default Program programIdToProgram(Long id) {
        if (id == null) return null;
        Program program = new Program();
        program.setId(id);
        return program;
    }

    @Named("courseSectionIdToCourseSection")
    default CourseSection courseSectionIdToCourseSection(Long id) {
        if (id == null) return null;
        CourseSection courseSection = new CourseSection();
        courseSection.setId(id);
        return courseSection;
    }

    @Named("academicPeriodIdToAcademicPeriod")
    default AcademicPeriod academicPeriodIdToAcademicPeriod(Long id) {
        if (id == null) return null;
        AcademicPeriod academicPeriod = new AcademicPeriod();
        academicPeriod.setId(id);
        return academicPeriod;
    }

    @Named("bigDecimalToDouble")
    default Double bigDecimalToDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }

    @Named("mapToExamDetailResponse")
    default ExamDetailResponse mapToExamDetailResponse(Exam exam, List<Question> questions,
                                                       ExamFileRepository examFileRepository,
                                                       AnswerRepository answerRepository) {
        // crear schedule response si esta disponible
        ScheduleResponse scheduleResponse = null;
        if (exam.getSchedule() != null) {
            Schedule schedule = exam.getSchedule();
            scheduleResponse = new ScheduleResponse(
                    schedule.getId(),
                    schedule.getName(),
                    schedule.getStartDateTime(),
                    schedule.getEndDateTime(),
                    schedule.getLocation(),
                    schedule.getType().name()
            );
        }

        // tener examen file response si esta disponible
        ExamFileResponse examFileResponse = null;
        List<ExamFile> examFiles = examFileRepository.findByExamIdAndFileCategoryAndAvailableTrue(
                exam.getId(), ExamFileType.EXAM_CONTENT);
        if (!examFiles.isEmpty()) {
            ExamFile file = examFiles.get(0);
            examFileResponse = new ExamFileResponse(
                    file.getId(),
                    file.getFileName(),
                    file.getFileType(),
                    file.getFileCategory().name(),
                    file.getData() != null ? Base64.getEncoder().encodeToString(file.getData()) : null
            );
        }

        // Map questions con sus respuestas
        List<QuestionResponse> questionResponses = questions.stream()
                .map(question -> {
                    // Map question file
                    ExamFileResponse questionFileResponse = null;
                    if (question.getExamFile() != null) {
                        ExamFile qFile = question.getExamFile();
                        questionFileResponse = new ExamFileResponse(
                                qFile.getId(),
                                qFile.getFileName(),
                                qFile.getFileType(),
                                qFile.getFileCategory().name(),
                                qFile.getData() != null ? Base64.getEncoder().encodeToString(qFile.getData()) : null
                        );
                    }

                    // Map answers por question
                    List<AnswerResponse> answerResponses = answerRepository.findByQuestionIdAndAvailableTrue(question.getId())
                            .stream()
                            .map(answer -> {
                                // Get answer file
                                ExamFileResponse answerFileResponse = null;
                                if (answer.getExamFile() != null) {
                                    ExamFile aFile = answer.getExamFile();
                                    answerFileResponse = new ExamFileResponse(
                                            aFile.getId(),
                                            aFile.getFileName(),
                                            aFile.getFileType(),
                                            aFile.getFileCategory().name(),
                                            aFile.getData() != null ? Base64.getEncoder().encodeToString(aFile.getData()) : null
                                    );
                                }

                                return new AnswerResponse(
                                        answer.getId(),
                                        answer.getAnswerText(),
                                        null,
                                        answerFileResponse
                                );
                            })
                            .collect(Collectors.toList());

                    return new QuestionResponse(
                            question.getId(),
                            question.getQuestionText(),
                            question.getType().name(),
                            question.getPosition(),
                            question.getPoints().doubleValue(),
                            questionFileResponse,
                            answerResponses
                    );
                })
                .collect(Collectors.toList());

        // crear y retornar ExamDetailResponse
        return new ExamDetailResponse(
                exam.getId(),
                exam.getName(),
                exam.getDescription(),
                exam.getProgram() != null ? exam.getProgram().getId() : null,
                exam.getProgram() != null ? exam.getProgram().getName() : null,
                exam.getCourseSection() != null ? exam.getCourseSection().getId() : null,
                exam.getCourseSection() != null ? exam.getCourseSection().getSection() : null,
                exam.getAcademicPeriod() != null ? exam.getAcademicPeriod().getId() : null,
                exam.getAcademicPeriod() != null ? exam.getAcademicPeriod().getName() : null,
                exam.getType().getDisplayName(),
                exam.getStatus().getDisplayName(),
                exam.getMaxScore().doubleValue(),
                exam.getTotalQuestions(),
                exam.getDurationMinutes(),
                exam.getPassingScore() != null ? exam.getPassingScore().doubleValue() : null,
                exam.getAttemptsAllowed(),
                exam.getShuffleQuestions(),
                scheduleResponse,
                examFileResponse,
                questionResponses
        );
    }

}
