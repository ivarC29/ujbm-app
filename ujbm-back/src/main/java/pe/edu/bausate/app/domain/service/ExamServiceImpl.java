package pe.edu.bausate.app.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.bausate.app.application.dto.exam.*;
import pe.edu.bausate.app.application.mapper.ExamMapper;
import pe.edu.bausate.app.domain.enumerate.*;
import pe.edu.bausate.app.domain.models.*;
import pe.edu.bausate.app.domain.repository.*;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamServiceImpl implements ExamService {
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final ExamFileRepository examFileRepository;
    private final ScheduleRepository scheduleRepository;
    private final ProgramRepository programRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final ExamMapper examMapper;

    @Transactional
    @Override
    public Long createExam(ExamCreateRequest request) {

        Program program = programRepository.findById(request.programId())
                .orElseThrow(() -> new EntityNotFoundException("Programa no encontrado"));

        CourseSection courseSection = null;
        if (request.courseSectionId() != null) {
            courseSection = courseSectionRepository.findById(request.courseSectionId())
                    .orElseThrow(() -> new EntityNotFoundException("Sección de curso no encontrada"));
        }

        AcademicPeriod academicPeriod = null;
        if (request.academicPeriodId() != null) {
            academicPeriod = academicPeriodRepository.findById(request.academicPeriodId())
                    .orElseThrow(() -> new EntityNotFoundException("Periodo académico no encontrado"));
        }

        Schedule schedule = null;
        if (request.schedule() != null) {
            if (request.schedule().endDateTime().isBefore(request.schedule().startDateTime())) {
                throw new IllegalArgumentException("El tiempo de finalización del examen no puede ser anterior al tiempo de inicio.");
            }
            if (request.schedule().endDateTime().isEqual(request.schedule().startDateTime())) {
                throw new IllegalArgumentException("El tiempo de finalización del examen no puede ser igual al tiempo de inicio.");
            }
            schedule = examMapper.scheduleCreateRequestToSchedule(request.schedule());
            schedule = scheduleRepository.save(schedule);
        }


        Exam exam = examMapper.examCreateRequestToExam(request);
        exam.setProgram(program);
        exam.setCourseSection(courseSection);
        exam.setAcademicPeriod(academicPeriod);
        exam.setSchedule(schedule);
        exam.setType(parseExamType(request.examType()));
        exam.setStatus(ExamStatus.DRAFT);
        exam.setTotalQuestions(request.questions() != null ? request.questions().size() : 0);
        exam = examRepository.save(exam);

        if (request.examFile() != null) {
            ExamFile examFile = examMapper.examFileRequestToExamFile(request.examFile());
            examFile.setExam(exam);
            examFileRepository.save(examFile);
        }

        if (request.questions() != null) {
            for (QuestionCreateRequest questionRequest : request.questions()) {
                QuestionType qType = parseQuestionType(questionRequest.questionType());
                Question question = examMapper.questionCreateRequestToQuestion(questionRequest);
                question.setType(qType);
                question.setExam(exam);
                question = questionRepository.save(question);

                if (questionRequest.questionFile() != null) {
                    ExamFile qFile = examMapper.questionFileRequestToExamFile(questionRequest.questionFile());
                    qFile.setExam(exam);
                    qFile = examFileRepository.save(qFile);
                    question.setExamFile(qFile);
                    questionRepository.save(question);
                }

                if (requiresPredefinedAnswers(qType) && questionRequest.answers() != null) {
                    for (AnswerCreateRequest answerRequest : questionRequest.answers()) {
                        Answer answer = examMapper.answerCreateRequestToAnswer(answerRequest);
                        answer.setQuestion(question);
                        answer = answerRepository.save(answer);

                        if (answerRequest.answerFile() != null) {
                            ExamFile aFile = examMapper.answerFileRequestToExamFile(answerRequest.answerFile());
                            aFile.setExam(exam);
                            aFile = examFileRepository.save(aFile);
                            answer.setExamFile(aFile);
                            answerRepository.save(answer);
                        }
                    }
                }
            }
        }
        return exam.getId();
    }

    /**
     * Crea un examen a partir de un archivo Excel
     *
     * @param request La solicitud que contiene el archivo Excel e información relacionada
     * @return El ID del examen creado
     *
     * FORMATO DEL ARCHIVO EXCEL:
     * -------------------------
     * El archivo Excel debe seguir esta estructura:
     *
     * FILA 0 (ENCABEZADO):
     * - Celda 0: "EXAMEN" (identificador)
     * - Celda 1: Nombre del examen (ej. "Examen Final Periodismo 2023")
     * - Celda 2: Descripción (ej. "Evaluación completa de conceptos de periodismo")
     * - Celda 3: Puntaje máximo (ej. 100)
     * - Celda 4: Duración en minutos (ej. 90)
     *
     * PREGUNTAS (a partir de la fila 2):
     * - Celda 0: "Q" (identifica una fila de pregunta)
     * - Celda 1: Número/posición de la pregunta (ej. 1)
     * - Celda 2: Texto de la pregunta (ej. "¿Cuál es el propósito principal del periodismo?")
     * - Celda 3: Tipo de pregunta (ej. "MULTIPLE_CHOICE", "ESSAY", "TRUE_FALSE")
     * - Celda 4: Puntos para esta pregunta (ej. 10)
     *
     * RESPUESTAS (siguen a cada pregunta):
     * - Celda 0: "A" (identifica una fila de respuesta)
     * - Celda 1: Número de la pregunta a la que pertenece (ej. 1)
     * - Celda 2: Texto de la respuesta (ej. "Informar al público de manera objetiva")
     * - Celda 3: Es correcta (true/false o 1/0)
     *
     * EJEMPLO:
     * Fila 0: "EXAMEN", "Fundamentos de Periodismo", "Conceptos básicos de periodismo primer año", 100, 60
     * Fila 1: [Vacía o encabezados de columna]
     * Fila 2: "Q", 1, "¿Qué es el periodismo?", "MULTIPLE_CHOICE", 5
     * Fila 3: "A", 1, "Una forma de entretenimiento", false
     * Fila 4: "A", 1, "La actividad de recopilar y reportar noticias", true
     * Fila 5: "A", 1, "Un tipo de literatura", false
     * Fila 6: "Q", 2, "Nombre tres principios éticos en el periodismo", "ESSAY", 10
     * ...
     */

    @Transactional
    @Override
    public Long createExamByExcel(ExamByExcelRequest request) {
        try {
            Program program = programRepository.findById(request.programId())
                    .orElseThrow(() -> new EntityNotFoundException("Programa no encontrado"));
            CourseSection courseSection = request.courseSectionId() != null
                    ? courseSectionRepository.findById(request.courseSectionId())
                    .orElseThrow(() -> new EntityNotFoundException("Sección de curso no encontrada"))
                    : null;
            AcademicPeriod academicPeriod = request.academicPeriodId() != null
                    ? academicPeriodRepository.findById(request.academicPeriodId())
                    .orElseThrow(() -> new EntityNotFoundException("Periodo académico no encontrado"))
                    : null;
            Schedule schedule = null;
            if (request.schedule() != null) {
                if (request.schedule().endDateTime().isBefore(request.schedule().startDateTime())) {
                    throw new IllegalArgumentException("El tiempo de finalización del examen no puede ser anterior al tiempo de inicio.");
                }
                if (request.schedule().endDateTime().isEqual(request.schedule().startDateTime())) {
                    throw new IllegalArgumentException("El tiempo de finalización del examen no puede ser igual al tiempo de inicio.");
                }
                schedule = examMapper.scheduleCreateRequestToSchedule(request.schedule());
                schedule = scheduleRepository.save(schedule);
            }


            Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(request.file().data()));
            Sheet sheet = workbook.getSheetAt(0);

            Row headerRow = sheet.getRow(0);
            String examName = getCellValueAsString(headerRow.getCell(1));
            String examDescription = headerRow.getCell(2) != null ? getCellValueAsString(headerRow.getCell(2)) : "";
            Double maxScore = headerRow.getCell(3) != null ? Double.parseDouble(getCellValueAsString(headerRow.getCell(3))) : 100.0;
            Integer durationMinutes = headerRow.getCell(4) != null ? Integer.parseInt(getCellValueAsString(headerRow.getCell(4))) : 90;

            Exam exam = new Exam();
            exam.setName(examName);
            exam.setDescription(examDescription);
            exam.setProgram(program);
            exam.setCourseSection(courseSection);
            exam.setAcademicPeriod(academicPeriod);
            exam.setSchedule(schedule);
            exam.setType(parseExamType(request.examType()));
            exam.setStatus(ExamStatus.DRAFT);
            exam.setMaxScore(BigDecimal.valueOf(maxScore));
            exam.setDurationMinutes(durationMinutes);
            exam.setPassingScore(request.passingScore() != null ? BigDecimal.valueOf(request.passingScore()) : null);
            exam.setAttemptsAllowed(request.attemptsAllowed());
            exam.setShuffleQuestions(request.shuffleQuestions());
            exam.setAvailable(true);

            if (request.examFile() != null) {
                ExamFile examFile = examMapper.examFileRequestToExamFile(request.examFile());
                examFile.setExam(exam);
                examFileRepository.save(examFile);
            }

            Map<Integer, Question> questions = new HashMap<>();
            int totalQuestions = 0;
            for (int i = 2; i < sheet.getPhysicalNumberOfRows(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String type = getCellValueAsString(row.getCell(0));
                if ("Q".equalsIgnoreCase(type)) {
                    Integer pos = Integer.parseInt(getCellValueAsString(row.getCell(1)));
                    String qText = getCellValueAsString(row.getCell(2));
                    String qTypeStr = getCellValueAsString(row.getCell(3));
                    Double points = Double.parseDouble(getCellValueAsString(row.getCell(4)));
                    QuestionType qType = parseQuestionType(qTypeStr);

                    Question question = new Question();
                    question.setQuestionText(qText);
                    question.setType(qType);
                    question.setPosition(pos);
                    question.setPoints(BigDecimal.valueOf(points));
                    question.setExam(exam);
                    question.setAvailable(true);
                    question = questionRepository.save(question);
                    questions.put(pos, question);
                    totalQuestions++;
                } else if ("A".equalsIgnoreCase(type)) {
                    Integer pos = Integer.parseInt(getCellValueAsString(row.getCell(1)));
                    String aText = getCellValueAsString(row.getCell(2));
                    String correctStr = getCellValueAsString(row.getCell(3));
                    boolean isCorrect = "true".equalsIgnoreCase(correctStr) || "1".equals(correctStr);

                    Question question = questions.get(pos);
                    if (question != null && requiresPredefinedAnswers(question.getType())) {
                        Answer answer = new Answer();
                        answer.setAnswerText(aText);
                        answer.setIsCorrect(isCorrect);
                        answer.setQuestion(question);
                        answer.setAvailable(true);
                        answerRepository.save(answer);
                    }
                }
            }
            exam.setTotalQuestions(totalQuestions);
            examRepository.save(exam);
            workbook.close();
            return exam.getId();
        } catch (Exception e) {
            log.error("Error processing Excel file", e);
            throw new RuntimeException("Error al procesar el archivo Excel: " + e.getMessage(), e);
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toString();
                } else {
                    // convertir a String si es numérico
                    return String.valueOf(cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            case BLANK:
                return "";
            default:
                return "";
        }
    }

    @Override
    public List<ExamListResponse> getExamsByType(String examType) {

        List<Exam> exams;

        if (examType != null && !examType.isEmpty()) {
            try {
                ExamType type = ExamType.valueOf(examType);
                exams = examRepository.findByTypeAndAvailableTrue(type);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Tipo de examen invalido: " + examType);
            }
        } else {
            exams = examRepository.findByAvailableTrue();
        }

        return exams.stream()
                .map(exam -> new ExamListResponse(
                        exam.getId(),
                        exam.getName(),
                        exam.getDescription(),
                        exam.getProgram() != null ? exam.getProgram().getName() : "N/A",
                        exam.getCourseSection() != null ? exam.getCourseSection().getSection() : "N/A",
                        exam.getAcademicPeriod() != null ? exam.getAcademicPeriod().getName() : "N/A",
                        exam.getType().name(),
                        exam.getStatus().name(),
                        exam.getMaxScore().toString(),
                        exam.getTotalQuestions(),
                        exam.getDurationMinutes(),
                        exam.getSchedule() != null ?
                            (exam.getSchedule().getStartDateTime() != null ?
                             exam.getSchedule().getStartDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "No programado") :
                            "No programmed",
                        exam.getPassingScore() != null ? exam.getPassingScore().toString() : "N/A",
                        exam.getAttemptsAllowed() != null ? exam.getAttemptsAllowed() : 1,
                        exam.getShuffleQuestions() != null ? exam.getShuffleQuestions() : false
                ))
                .collect(Collectors.toList());
    }

    @Override
    public ExamDetailResponse getExamById(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntityNotFoundException("Examen no encontrado"));

        List<Question> questions = questionRepository.findByExamIdOrderByPosition(examId);

        return mapToExamDetailResponse(exam, questions);
    }

    @Transactional
    @Override
    public Long updateExam(Long examId, ExamUpdateRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntityNotFoundException("Examen no encontrado"));

        if (request.name() != null) exam.setName(request.name());
        if (request.description() != null) exam.setDescription(request.description());
        if (request.status() != null) exam.setStatus(parseExamStatus(request.status()));
        if (request.maxScore() != null) exam.setMaxScore(BigDecimal.valueOf(request.maxScore()));
        if (request.passingScore() != null) exam.setPassingScore(BigDecimal.valueOf(request.passingScore()));
        if (request.durationMinutes() != null) exam.setDurationMinutes(request.durationMinutes());
        if (request.attemptsAllowed() != null) exam.setAttemptsAllowed(request.attemptsAllowed());
        if (request.shuffleQuestions() != null) exam.setShuffleQuestions(request.shuffleQuestions());

        if (request.programId() != null) {
            Program program = programRepository.findById(request.programId())
                    .orElseThrow(() -> new EntityNotFoundException("Programa no encontrado"));
            exam.setProgram(program);
        }
        if (request.courseSectionId() != null) {
            CourseSection courseSection = courseSectionRepository.findById(request.courseSectionId())
                    .orElseThrow(() -> new EntityNotFoundException("Sección de curso no encontrada"));
            exam.setCourseSection(courseSection);
        }
        if (request.academicPeriodId() != null) {
            AcademicPeriod academicPeriod = academicPeriodRepository.findById(request.academicPeriodId())
                    .orElseThrow(() -> new EntityNotFoundException("Periodo académico no encontrado"));
            exam.setAcademicPeriod(academicPeriod);
        }
        if (request.schedule() != null) {
            if (request.schedule().endDateTime().isBefore(request.schedule().startDateTime())) {
                throw new IllegalArgumentException("El tiempo de finalización del examen no puede ser anterior al tiempo de inicio.");
            }
            if (request.schedule().endDateTime().isEqual(request.schedule().startDateTime())) {
                throw new IllegalArgumentException("El tiempo de finalización del examen no puede ser igual al tiempo de inicio.");
            }
            Schedule schedule = exam.getSchedule();
            if (schedule == null) {
                schedule = new Schedule();
                schedule.setAvailable(true);
                schedule.setType(ScheduleType.EXAM);
            }
            if (request.schedule().name() != null) schedule.setName(request.schedule().name());
            if (request.schedule().startDateTime() != null) schedule.setStartDateTime(request.schedule().startDateTime());
            if (request.schedule().endDateTime() != null) schedule.setEndDateTime(request.schedule().endDateTime());
            if (request.schedule().location() != null) schedule.setLocation(request.schedule().location());
            schedule = scheduleRepository.save(schedule);
            exam.setSchedule(schedule);
        }
        if (request.examFile() != null) {
            List<ExamFile> existingFiles = examFileRepository.findByExamIdAndFileCategoryAndAvailableTrue(
                    exam.getId(), ExamFileType.EXAM_CONTENT);
            ExamFile examFile;
            if (!existingFiles.isEmpty()) {
                examFile = existingFiles.get(0);
                if (request.examFile().fileName() != null) examFile.setFileName(request.examFile().fileName());
                if (request.examFile().fileType() != null) examFile.setFileType(request.examFile().fileType());
                if (request.examFile().data() != null) examFile.setData(request.examFile().data());
            } else {
                examFile = examMapper.examFileRequestToExamFile(request.examFile());
                examFile.setExam(exam);
            }
            examFileRepository.save(examFile);
        }

        if (request.questions() != null) {
            List<Question> existingQuestions = questionRepository.findByExamIdOrderByPosition(examId);
            List<Long> updatedQuestionIds = new ArrayList<>();
            for (QuestionUpdateRequest questionRequest : request.questions()) {
                QuestionType qType = parseQuestionType(questionRequest.questionType());
                Question question;
                if (questionRequest.id() != null) {
                    question = existingQuestions.stream()
                            .filter(q -> q.getId().equals(questionRequest.id()))
                            .findFirst()
                            .orElseThrow(() -> new EntityNotFoundException("Pregunta no encontrada: " + questionRequest.id()));
                    if (questionRequest.questionText() != null) question.setQuestionText(questionRequest.questionText());
                    if (qType != null) question.setType(qType);
                    if (questionRequest.position() != null) question.setPosition(questionRequest.position());
                    if (questionRequest.points() != null) question.setPoints(BigDecimal.valueOf(questionRequest.points()));
                } else {
                    question = new Question();
                    question.setQuestionText(questionRequest.questionText());
                    question.setType(qType);
                    question.setPosition(questionRequest.position());
                    question.setPoints(BigDecimal.valueOf(questionRequest.points()));
                    question.setExam(exam);
                    question.setAvailable(true);
                }
                question = questionRepository.save(question);
                updatedQuestionIds.add(question.getId());

                if (questionRequest.questionFile() != null) {
                    ExamFile questionFile;
                    if (question.getExamFile() != null) {
                        questionFile = question.getExamFile();
                        if (questionRequest.questionFile().fileName() != null) questionFile.setFileName(questionRequest.questionFile().fileName());
                        if (questionRequest.questionFile().fileType() != null) questionFile.setFileType(questionRequest.questionFile().fileType());
                        if (questionRequest.questionFile().data() != null) questionFile.setData(questionRequest.questionFile().data());
                    } else {
                        questionFile = examMapper.questionFileRequestToExamFile(questionRequest.questionFile());
                        questionFile.setExam(exam);
                    }
                    questionFile = examFileRepository.save(questionFile);
                    question.setExamFile(questionFile);
                    questionRepository.save(question);
                }

                if (requiresPredefinedAnswers(qType) && questionRequest.answers() != null) {
                    List<Answer> existingAnswers = answerRepository.findByQuestionIdAndAvailableTrue(question.getId());
                    List<Long> updatedAnswerIds = new ArrayList<>();
                    for (AnswerUpdateRequest answerRequest : questionRequest.answers()) {
                        Answer answer;
                        if (answerRequest.id() != null) {
                            answer = existingAnswers.stream()
                                    .filter(a -> a.getId().equals(answerRequest.id()))
                                    .findFirst()
                                    .orElseThrow(() -> new EntityNotFoundException("Respuesta no encontrada: " + answerRequest.id()));
                            if (answerRequest.answerText() != null) answer.setAnswerText(answerRequest.answerText());
                            if (answerRequest.isCorrect() != null) answer.setIsCorrect(answerRequest.isCorrect());
                        } else {
                            answer = new Answer();
                            answer.setAnswerText(answerRequest.answerText());
                            answer.setIsCorrect(answerRequest.isCorrect() != null ? answerRequest.isCorrect() : false);
                            answer.setQuestion(question);
                            answer.setAvailable(true);
                        }
                        answer = answerRepository.save(answer);
                        updatedAnswerIds.add(answer.getId());

                        if (answerRequest.answerFile() != null) {
                            ExamFile answerFile;
                            if (answer.getExamFile() != null) {
                                answerFile = answer.getExamFile();
                                if (answerRequest.answerFile().fileName() != null) answerFile.setFileName(answerRequest.answerFile().fileName());
                                if (answerRequest.answerFile().fileType() != null) answerFile.setFileType(answerRequest.answerFile().fileType());
                                if (answerRequest.answerFile().data() != null) answerFile.setData(answerRequest.answerFile().data());
                            } else {
                                answerFile = examMapper.answerFileRequestToExamFile(answerRequest.answerFile());
                                answerFile.setExam(exam);
                            }
                            answerFile = examFileRepository.save(answerFile);
                            answer.setExamFile(answerFile);
                            answerRepository.save(answer);
                        }
                    }
                    existingAnswers.stream()
                            .filter(a -> !updatedAnswerIds.contains(a.getId()))
                            .forEach(a -> {
                                a.setAvailable(false);
                                answerRepository.save(a);
                            });
                }
            }
            existingQuestions.stream()
                    .filter(q -> !updatedQuestionIds.contains(q.getId()))
                    .forEach(q -> {
                        q.setAvailable(false);
                        questionRepository.save(q);
                    });
            exam.setTotalQuestions(updatedQuestionIds.size());
        }
        return examRepository.save(exam).getId();
    }

    @Transactional
    @Override
    public boolean deleteExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntityNotFoundException("Examen no encontrado"));

        exam.setAvailable(false);
        examRepository.save(exam);

        return true;
    }

    private ExamDetailResponse mapToExamDetailResponse(Exam exam, List<Question> questions) {

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
                    file.getData() != null ? java.util.Base64.getEncoder().encodeToString(file.getData()) : null
            );
        }


        List<QuestionResponse> questionResponses = questions.stream()
                .map(question -> {

                    ExamFileResponse questionFileResponse = null;
                    if (question.getExamFile() != null) {
                        ExamFile qFile = question.getExamFile();
                        questionFileResponse = new ExamFileResponse(
                                qFile.getId(),
                                qFile.getFileName(),
                                qFile.getFileType(),
                                qFile.getFileCategory().name(),
                                qFile.getData() != null ? java.util.Base64.getEncoder().encodeToString(qFile.getData()) : null
                        );
                    }


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
                                            aFile.getData() != null ? java.util.Base64.getEncoder().encodeToString(aFile.getData()) : null
                                    );
                                }

                                return new AnswerResponse(
                                        answer.getId(),
                                        answer.getAnswerText(),
                                        answer.getIsCorrect(),
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


    // TODO HACER UN UTIL
    private ExamStatus parseExamStatus(String value) {
        if (value == null) return null;
        try {
            return ExamStatus.valueOf(value);
        } catch (IllegalArgumentException e) {
            for (ExamStatus status : ExamStatus.values()) {
                if (status.getDisplayName().equalsIgnoreCase(value)) return status;
            }
            throw new IllegalArgumentException("Invalid ExamStatus: " + value);
        }
    }
    private ExamType parseExamType(String value) {
        if (value == null) return null;
        try {
            return ExamType.valueOf(value);
        } catch (IllegalArgumentException e) {
            for (ExamType type : ExamType.values()) {
                if (type.getDisplayName().equalsIgnoreCase(value)) return type;
            }
            throw new IllegalArgumentException("Invalid ExamType: " + value);
        }
    }
    private QuestionType parseQuestionType(String value) {
        if (value == null) return null;
        try {
            return QuestionType.valueOf(value);
        } catch (IllegalArgumentException e) {
            for (QuestionType type : QuestionType.values()) {
                if (type.getDisplayName().equalsIgnoreCase(value)) return type;
            }
            throw new IllegalArgumentException("Invalid QuestionType: " + value);
        }
    }
    private boolean requiresPredefinedAnswers(QuestionType type) {
        if (type == null) return true;
        return !(type == QuestionType.ESSAY || type == QuestionType.FILE_UPLOAD || type == QuestionType.SHORT_ANSWER);
    }



}
