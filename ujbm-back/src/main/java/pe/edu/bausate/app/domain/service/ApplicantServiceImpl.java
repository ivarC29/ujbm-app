package pe.edu.bausate.app.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.bausate.app.application.dto.applicant.*;
import pe.edu.bausate.app.application.dto.exam.ExamAutomaticSubmissionRequest;
import pe.edu.bausate.app.application.dto.exam.ExamDetailResponse;
import pe.edu.bausate.app.application.mapper.ApplicantMapper;
import pe.edu.bausate.app.application.mapper.ExamMapper;
import pe.edu.bausate.app.application.mapper.FileMapper;
import pe.edu.bausate.app.domain.enumerate.*;
import pe.edu.bausate.app.domain.models.*;
import pe.edu.bausate.app.domain.models.auth.User;
import pe.edu.bausate.app.domain.models.projection.AcademicPeriodProjection;
import pe.edu.bausate.app.domain.models.projection.ApplicantResumeProjection;
import pe.edu.bausate.app.domain.models.projection.ApplicantScoreProjection;
import pe.edu.bausate.app.domain.repository.*;
import pe.edu.bausate.app.application.service.email.EmailService;
import pe.edu.bausate.app.domain.service.report.EnrollmentCertificateReport;
import pe.edu.bausate.app.domain.specification.ApplicantSpecification;
import pe.edu.bausate.app.infraestructure.exception.DuplicateDniException;
import pe.edu.bausate.app.infraestructure.exception.NotFoundException;
import pe.edu.bausate.app.infraestructure.util.SystemParameterKeys;
import pe.edu.bausate.app.infraestructure.util.helper.ApplicantUtils;
import pe.edu.bausate.app.infraestructure.util.helper.ExamUtils;
import pe.edu.bausate.app.infraestructure.util.helper.PageableUtils;
import pe.edu.bausate.app.infraestructure.util.helper.StudentUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicantServiceImpl implements ApplicantService {
    private final ApplicantRepository applicantRepository;
    private final PersonRepository personRepository;
    private final ProgramRepository programRepository;
    private final StudentRepository studentRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final ApplicantFileRepository applicantFileRepository;
    private final ScoreRepository scoreRepository;
    private final ApplicantMapper applicantMapper;
    private final EmailService emailService;
    private final SystemParameterService systemParameterService;
    private final UserService userService;
    private final EnrollmentService enrollmentService;
    private final EnrollmentCertificateReport enrollmentCertificateReport;

    private final UbigeoRepository ubigeoRepository;
    private final FileMapper fileMapper;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ExamMapper examMapperService;
    private final ExamFileRepository examFileRepository;
    private final AnswerRepository answerRepository;

    private final AppointmentService appointmentService;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    // Public methods

    @Transactional(rollbackFor = Exception.class)
    public ApplicantResponse registerApplicant(ApplicantRequest request) {
        if (applicantRepository.existsByPersonDocumentNumber(request.person().documentNumber())) {
            throw new DuplicateDniException("El " + DisplayableEnum.fromCode(DocumentIdType.class, request.person().documentIdType()).getDisplayName() +" ya está registrado");
        }

        Program program = programRepository.findById(request.programId())
                .orElseThrow(() -> new EntityNotFoundException("Programa no encontrado"));

        Ubigeo personUbigeo = ubigeoRepository.findByCodes(
                request.person().ubigeo().departmentCode(),
                request.person().ubigeo().provinceCode(),
                request.person().ubigeo().districtCode())
                .orElseThrow(() -> new EntityNotFoundException("Ubigeo persona no encontrado"));

        Ubigeo schoolUbigeo = ubigeoRepository.findByCodes(
                        request.highSchoolInfo().ubigeo().departmentCode(),
                        request.highSchoolInfo().ubigeo().provinceCode(),
                        request.highSchoolInfo().ubigeo().districtCode())
                .orElseThrow(() -> new EntityNotFoundException("Ubigeo escuela no encontrado"));

        String currentPeriod = academicPeriodRepository
                .findCurrentAcademicPeriod()
                .map(AcademicPeriodProjection::getName)
                .orElseThrow(() -> new NotFoundException("No hay periodo académico disponible"));

        Applicant applicant = applicantMapper.applicantRequestToApplicant(request);

        applicant.setProgram(program);
        applicant.getPerson().setUbigeo(personUbigeo);
        applicant.getHighSchoolInfo().setUbigeo(schoolUbigeo);
        applicant.setAcademicPeriodName(currentPeriod);
        ApplicantUtils.generateApplicantCode(applicant);

        personRepository.save(applicant.getPerson());

        return applicantMapper.applicantToApplicantResponse(applicantRepository.save(applicant));
    }

    @Transactional
    @Override
    public ApplicantResumeResponse getApplicantResumeByDni(String dni, String paymentType) {
        ApplicantResumeProjection projection = applicantRepository.findApplicantProjectionByDni(dni, paymentType)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado con DNI: " + dni));

        BigDecimal amount = null;
        if ("PAYMENT1".equals(paymentType)) {
            Object value = systemParameterService.get(SystemParameterKeys.ADMISSION_EXAM_FEE);
            amount = ApplicantUtils.validateAmountSystemParameter(value);
        } else if ("PAYMENT2".equals(paymentType)) {
            Object value = systemParameterService.get(SystemParameterKeys.MATRICULA_COST);
            amount = ApplicantUtils.validateAmountSystemParameter(value);
        } else {
            throw new IllegalArgumentException("Tipo de pago inválido");
        }

        return new ApplicantResumeResponse(
                projection.getId(),
                projection.getCode(),
                projection.getFullName(),
                projection.getDocumentNumber(),
                projection.getProgramName(),
                projection.getEnrollmentMode().getDisplayName(),
                projection.getRegistryDate(),
                projection.getAcademicPeriod(),
                amount
        );
    }

    @Transactional
    @Override
    public void uploadPaymentReceipt(String dni, MultipartFile file, String paymentReceiptType) throws IOException {
        Applicant applicant = applicantRepository.findByPersonDocumentNumber(dni)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado con DNI: " + dni));

        // Guardar el archivo en el sistema de archivos o base de datos
        ApplicantFile paymentReceipt = new ApplicantFile();
        paymentReceipt.setFileName("boleta_" + dni + "_" + System.currentTimeMillis());
        paymentReceipt.setFileType(file.getContentType());
        paymentReceipt.setData(file.getBytes());
        if (paymentReceiptType.equals("PAYMENT1")) {
            applicant.setPaymentReceiptFile1(paymentReceipt);
        } else if (paymentReceiptType.equals("PAYMENT2")) {
            applicant.setPaymentReceiptFile2(paymentReceipt);
        } else {
            throw new IllegalArgumentException("Tipo de recibo de pago inválido");
        }
        applicantRepository.save(applicant);
    }

    // Admin methods

    @Transactional(readOnly = true)
    @Override
    public Page<ApplicantTableInfoResponse> filterApplicants(ApplicantFilterRequest filterRequest) {
        PageRequest pageRequest = PageableUtils.fromFilterRequest(
                filterRequest.page(),
                filterRequest.size(),
                filterRequest.sortBy(),
                filterRequest.sortDirection()
        );

        Specification<Applicant> spec = ApplicantSpecification.filterBy(filterRequest);

        return applicantRepository.findAll(spec, pageRequest)
                .map(applicantMapper::applicantToApplicantTableInfoResponse);
    }

    @Transactional
    @Override
    public StudentConversionResponse convertApplicantToStudent(Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new IllegalArgumentException("Postulante no encontrado"));

        if (!Boolean.TRUE.equals(applicant.getDniValidated()) ||
                !Boolean.TRUE.equals(applicant.getCertificateValidated()) ||
                !Boolean.TRUE.equals(applicant.getPhotoValidated())) {
            throw new IllegalStateException("Los documentos del postulante no están completamente validados");
        }

        Score score = applicant.getScore();
        if (score == null) {
            throw new IllegalStateException("El postulante no tiene un puntaje registrado");
        }

        double minimumScore = applicant.getPerson().getEnrollmentMode().getMinimumScore();
        if (score.getTotalScore() < minimumScore) {
            throw new IllegalStateException("El postulante no cumple con el puntaje mínimo requerido");
        }

        if (!Boolean.TRUE.equals(applicant.getIsEnrolled())) {
            throw new IllegalStateException("El pago del postulante no está confirmado");
        }

        Person person = applicant.getPerson();

        if (studentRepository.existsByPerson(person)) {
            throw new IllegalStateException("Esta persona ya es estudiante");
        }

        String studentCode = StudentUtils.generateUniqueStudentCode(studentRepository);

        Student student = Student.builder()
                .code(studentCode)
                .enrollmentDate(LocalDate.now())
                .program(applicant.getProgram())
                .person(person)
                .cycle(1) // Asignar ciclo inicial
                .available(true)
                .build();

        student = studentRepository.save(student);

        personRepository.updatePersonType(person.getId(), PersonType.STUDENT);

        User userStudent = userService.createStudentUser(student);

        enrollmentService.generatePreEnrollment(student);

        StudentUtils.sendWelcomeEmailWithCredentials(student, userStudent.getRawPassword(), emailService, enrollmentCertificateReport);

        applicantRepository.disableApplicant(applicantId);

        return StudentConversionResponse.fromStudent(student);
    }

    @SneakyThrows
    @Transactional
    public void validateDocument(Long applicantId, String documentType) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado"));

        //Para payment 1, verificar si hay un examen disponible
        if ("PAYMENT1".equals(documentType)) {
            String programName = applicant.getProgram().getName().toLowerCase();
            boolean isInterview = programName.contains("periodismo") || programName.contains("comunicación audiovisual");

            if (!isInterview) {
                Optional<Exam> examOpt = findNextAvailableExamForApplicant(applicantId);
                if (examOpt.isEmpty()) {
                    throw new IllegalStateException("No hay exámenes de admisión programados para la carrera " +
                            applicant.getProgram().getName() + ". Es necesario crear al menos un examen antes de validar el pago.");
                }
            }
        }

        switch (documentType) {
            case "DNI" -> applicant.setDniValidated(true);
            case "CERTIFICATE" -> applicant.setCertificateValidated(true);
            case "PHOTO" -> applicant.setPhotoValidated(true);
            case "PAYMENT1", "PAYMENT2" -> ApplicantUtils.validatePayment(applicant, documentType);

            default -> throw new IllegalArgumentException("Tipo de documento inválido");
        }
        if ("PAYMENT1".equals(documentType)) {
            // Asignar examen solo si la carrera no es entrevista
            String programName = applicant.getProgram().getName().toLowerCase();
            boolean isInterview = programName.contains("periodismo") || programName.contains("comunicación audiovisual");
            if (isInterview) {
                // Crear cita con entrevistador disponible y enviar confirmación
                appointmentService.createAppointmentForApplicant(applicantId);
            }else{
                assignNextExamToApplicant(applicantId);
                ApplicantUtils.sendAdmissionTestInfoEmail(applicant, emailService);
            }

        }

        // Si todos los documentos principales están validados, cambiar el estado a "UNDER_REVIEW" pero ya no enviamos emaill
        if (Boolean.TRUE.equals(applicant.getDniValidated()) &&
                Boolean.TRUE.equals(applicant.getCertificateValidated()) &&
                Boolean.TRUE.equals(applicant.getPhotoValidated())) {
            applicant.setStatus(ApplicantStatus.UNDER_REVIEW);
        }

        applicantRepository.save(applicant);
    }

    @Transactional
    public void rejectDocument(Long applicantId, String documentType) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado"));

        switch (documentType.toUpperCase()) {
            case "DNI" -> {
                applicant.setDniValidated(false);
                applicant.setStatus(ApplicantStatus.REJECTED);
            }
            case "CERTIFICATE" -> {
                applicant.setCertificateValidated(false);
                applicant.setStatus(ApplicantStatus.REJECTED);
            }
            case "PHOTO" -> {
                applicant.setPhotoValidated(false);
                applicant.setStatus(ApplicantStatus.REJECTED);
            }
            case "PAYMENT1" -> {
                applicant.setHasPaidAdmissionFee(false);
                applicant.setStatus(ApplicantStatus.REJECTED);
            }
            case "PAYMENT2" -> {
                applicant.setIsEnrolled(false);
                applicant.setStatus(ApplicantStatus.REJECTED);
            }
            default -> throw new IllegalArgumentException("Tipo de documento inválido");
        }

        applicantRepository.save(applicant);
    }

    @Transactional
    public void uploadScores(MultipartFile file) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            List<String> lines = reader.lines()
                    .filter(line -> !line.startsWith("CODIGO"))
                    .toList();

            // Obtener solo los códigos presentes en el archivo
            Set<String> codes = lines.stream()
                    .map(line -> line.split(";")[0].trim())
                    .collect(Collectors.toSet());

            // Obtener solo los applicants necesarios
            Map<String, Applicant> applicantMap = applicantRepository.findAllByCodeIn(codes).stream()
                    .collect(Collectors.toMap(Applicant::getCode, Function.identity()));

            List<Applicant> updatedApplicants = new ArrayList<>();

            for (String line : lines) {
                String[] parts = line.split(";");
                String code = parts[0].trim();
                double totalScore = Double.parseDouble(parts[2].replace(",", ".").trim());
                String[] answers = Arrays.copyOfRange(parts, 4, parts.length);

                Applicant applicant = applicantMap.get(code);
                if (applicant == null) {
                    throw new NotFoundException("Postulante no encontrado con el código: " + code);
                }

                Score score = applicant.getScore();
                if (score == null) {
                    score = new Score();
                    score.setApplicant(applicant);
                    applicant.setScore(score);
                }

                score.setTotalScore((int) totalScore);
                score.setAnswers(String.join(";", answers));

                updatedApplicants.add(applicant);
            }

            applicantRepository.saveAll(updatedApplicants);
        } catch (IOException e) {
            throw new RuntimeException("Error al procesar el archivo", e);
        }
    }

    @Transactional(readOnly = true)
    public ApplicantFileResponse downloadFile(Long fileId) {
        ApplicantFile fileEntity = applicantFileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("Archivo no encontrado con ID: " + fileId));

        return fileMapper.fileToFileResponse(fileEntity);
    }

    @Transactional
    public void deleteFile(Long fileId) {
        ApplicantFile fileEntity = applicantFileRepository.findById(fileId)
                .orElseThrow(() -> new NotFoundException("Archivo no encontrado con ID: " + fileId));

        applicantFileRepository.delete(fileEntity);
    }

    @Transactional(readOnly = true)
    public ApplicantScoreResponse getApplicantScoreDetails(Long applicantId) {
        ApplicantScoreProjection projection = applicantRepository.findApplicantScoreDetails(applicantId)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado"));

        // Buscar el periodo académico basado en el registryDate del Applicant
        String academicPeriodName = academicPeriodRepository
                .findAcademicPeriodByDate(projection.getRegistryDate())
                .map(AcademicPeriodProjection::getName)
                .orElseThrow(() -> new NotFoundException("No se encontró un periodo académico para la fecha de registro"));

        boolean isApproved = projection.getTotalScore() >= projection.getEnrollmentMode().getMinimumScore();

        return applicantMapper.applicantScoreProjectionToResponse(projection, academicPeriodName, isApproved);
    }



    @Transactional
    public void updateApplicantScore(Long applicantId, Integer newTotalScore, List<String> answers) {
        // Validar que el postulante exista
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado con ID: " + applicantId));

        // Buscar el Score asociado al Applicant
        Score score = scoreRepository.findByApplicantId(applicantId)
                .orElseGet(() -> {
                    // Crear un nuevo Score si no existe
                    Score newScore = new Score();
                    newScore.setApplicant(applicantRepository.getReferenceById(applicantId));
                    return newScore;
                });

        // Actualizar los valores del Score
        score.setTotalScore(newTotalScore);
        score.setAnswers(String.join(";", answers));

//      Ya no se envia automaticamente uno apruebe  ApplicantUtils.sendScoreApprovalEmailIfNeeded(applicant,emailService,frontendBaseUrl);
        // Guardar solo el Score
        scoreRepository.save(score);
    }

    public List<ApplicantFile> getSyllabusFilesByApplicantId(Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado"));
        return applicant.getSyllabusFiles();
    }

    @SneakyThrows
    @Transactional
    public void rejectSyllabus(Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado"));

        // Cambia el estado o elimina los archivos si es necesario
        if (applicant.getSyllabusFiles() != null) {
            applicant.getSyllabusFiles().clear();
        }
        applicant.setStatus(ApplicantStatus.REJECTED);

        applicantRepository.save(applicant);

        // Envía el correo

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", applicant.getPerson().getName());
        // TODO: Cambiar a parametro del sistema
        variables.put("logoUrl", "https://bausate.edu.pe/wp-content/uploads/2021/11/cropped-Logo_ico-180x180.png");
        emailService.send("syllabus-rejected", applicant.getPerson().getEmail(), variables);
    }

    // Exam methods
    @Override
    public ExamAccessResponse validateExamAccess(String dni) {
        Applicant applicant = applicantRepository.findByPersonDocumentNumber(dni)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado con DNI: " + dni));

        boolean canAccessExam = Boolean.TRUE.equals(applicant.getHasPaidAdmissionFee());
        boolean hasExistingScore = applicant.getScore() != null && applicant.getScore().getTotalScore() != null;

        String message;
        if (!canAccessExam) {
            message = "El postulante debe realizar el pago del examen de admisión primero.";
        } else if (hasExistingScore) {
            message = "El postulante ya ha rendido el examen de admisión o entrevista, ya cuenta con nota.";
            canAccessExam = false;
        } else {
            message = "El postulante puede acceder al examen de admisión.";
        }

        // Prepare exam details if access is allowed
        ExamDetailResponse examDetail = null;
        if (canAccessExam && !hasExistingScore && applicant.getAssignedExam() != null) {
            Exam exam = applicant.getAssignedExam();

            // Check if exam is available (published or active)
            if (exam.getStatus() == ExamStatus.PUBLISHED || exam.getStatus() == ExamStatus.ACTIVE) {
                // Fetch all questions for this exam (filtering by available = true)
                List<Question> questions = questionRepository.findByExamIdAndAvailableTrue(exam.getId());

                // Use the mapper to convert exam and questions to ExamDetailResponse
                examDetail = examMapperService.mapToExamDetailResponse(exam, questions, examFileRepository, answerRepository);
            }
        }

        // Return response with exam details
        return new ExamAccessResponse(
                applicant.getId(),
                applicant.getCode(),
                applicant.getPerson().getName() + " " + applicant.getPerson().getLastname(),
                applicant.getProgram().getName(),
                canAccessExam && !hasExistingScore,
                message,
                examDetail
        );
    }

   @Override
   @Transactional
   public ExamSubmissionResponse submitExamAnswers(String dni, ExamAutomaticSubmissionRequest request) {
       Applicant applicant = applicantRepository.findByPersonDocumentNumber(dni)
           .orElseThrow(() -> new EntityNotFoundException("Postulante no encontrado"));

       Exam exam = applicant.getAssignedExam();
       if (exam == null) throw new EntityNotFoundException("No tiene examen asignado");

       List<Question> questions = questionRepository.findByExamIdAndAvailableTrue(exam.getId());

       // Map of applicant answers: questionId -> list of answerIds
       Map<Long, List<Long>> applicantAnswers = request.answers().stream()
           .collect(Collectors.toMap(
               ExamAutomaticSubmissionRequest.AnswerSubmission::questionId,
               ExamAutomaticSubmissionRequest.AnswerSubmission::selectedAnswerIds
           ));

       // Calculate score
       double totalScore = ExamUtils.gradeAutomaticExam(questions, applicantAnswers, answerRepository);

       // Build the answer letters string
       List<String> answerLetters = new ArrayList<>();
       for (Question question : questions) {
           List<Answer> possibleAnswers = answerRepository.findByQuestionIdAndAvailableTrue(question.getId());
           List<Long> selectedIds = applicantAnswers.getOrDefault(question.getId(), List.of());

           StringBuilder letters = new StringBuilder();
           for (Long selectedId : selectedIds) {
               int idx = -1;
               for (int i = 0; i < possibleAnswers.size(); i++) {
                   if (possibleAnswers.get(i).getId().equals(selectedId)) {
                       idx = i;
                       break;
                   }
               }
               if (idx >= 0) {
                   letters.append((char) ('A' + idx));
               }
           }
           answerLetters.add(letters.length() > 0 ? letters.toString() : " ");
       }
       String answersString = String.join(";", answerLetters);

       // Save or update Score
       Score score = applicant.getScore();
       if (score == null) {
           score = new Score();
           score.setApplicant(applicant);
       }
       score.setTotalScore((int) Math.round(totalScore));
       score.setAnswers(answersString);
       scoreRepository.save(score);

       // Response (score and approval status hidden)
       return new ExamSubmissionResponse(
           applicant.getId(),
           applicant.getCode(),
           applicant.getPerson().getName() + " " + applicant.getPerson().getLastname(),
           "Examen enviado correctamente"
       );
   }

   @Override
   public ApplicantScorePublicResponse getApplicantScoreByDni(String dni) {
       // Ver si las notas estan disponibles para mostrar
       Object scoreReleaseTimeObj = systemParameterService.get(SystemParameterKeys.ADMISSION_EXAM_SCORE_DISPLAY_TIME);

       if (scoreReleaseTimeObj == null) {
           return new ApplicantScorePublicResponse(
               null, null, null, null, false,
               "No se ha configurado la hora de publicación de resultados."
           );
       }

       // Parse the time parameter
       LocalTime releaseTime;
       if (scoreReleaseTimeObj instanceof LocalTime) {
           releaseTime = (LocalTime) scoreReleaseTimeObj;
       } else {
           try {
               releaseTime = LocalTime.parse(scoreReleaseTimeObj.toString());
           } catch (Exception e) {
               log.error("Formato de hora inválido para publicación de resultados: {}", scoreReleaseTimeObj);
               return new ApplicantScorePublicResponse(
                   null, null, null, null, false,
                   "Error en la configuración de publicación de resultados."
               );
           }
       }

       LocalTime now = LocalTime.now(ZoneId.of("America/Lima"));
       if (now.isBefore(releaseTime)) {
           return new ApplicantScorePublicResponse(
               null, null, null, null, false,
               "Los resultados estarán disponibles a partir de las " + releaseTime.format(DateTimeFormatter.ofPattern("HH:mm"))
           );
       }

       Applicant applicant = applicantRepository.findByPersonDocumentNumber(dni)
           .orElseThrow(() -> new NotFoundException("No se encontró postulante con DNI: " + dni));

       // nota
       Score score = applicant.getScore();
       if (score == null) {
           return new ApplicantScorePublicResponse(
               applicant.getCode(),
               applicant.getPerson().getName() + " " + applicant.getPerson().getLastname(),
               applicant.getProgram().getName(),
               null,
               false,
               "El postulante aún no tiene una calificación registrada."
           );
       }


       double minimumScore = applicant.getPerson().getEnrollmentMode().getMinimumScore();
       boolean isApproved = score.getTotalScore() >= minimumScore;

       return new ApplicantScorePublicResponse(
           applicant.getCode(),
           applicant.getPerson().getName() + " " + applicant.getPerson().getLastname(),
           applicant.getProgram().getName(),
           score.getTotalScore(),
           isApproved,
           isApproved ? "¡Felicidades! Has aprobado el examen de admisión." :
                       "Lo sentimos, no has alcanzado el puntaje mínimo requerido."
       );
   }

    @Override
    @Transactional(readOnly = true)
    public List<PendingInterviewApplicantResponse> getPendingJournalismInterviews() {
        // Buscar postulantes de periodismo que:
        // 1. Han pagado la cuota de examen de admisión
        // 2. No tienen puntuación registrada
        // 3. Están activos
        // 4. No están en estado REJECTED
        // 5. Son del programa de periodismo

        return applicantRepository.findPendingJournalismInterviews().stream()
                .map(applicant -> new PendingInterviewApplicantResponse(
                        applicant.getId(),
                        applicant.getCode(),
                        applicant.getPerson().getName() + " " + applicant.getPerson().getLastname(),
                        applicant.getPerson().getDocumentNumber(),
                        applicant.getRegistryDate(),
                        applicant.getProgram().getName(),
                        applicant.getPerson().getEmail(),
                        applicant.getPerson().getPhoneNumber()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApplicantScoreResponse setPublicInterviewScore(String dni, Integer score) {
        // Validar que el postulante exista
        Applicant applicant = applicantRepository.findByPersonDocumentNumber(dni)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado con DNI: " + dni));

        // Validar que el postulante haya pagado la cuota de examen
        if (!Boolean.TRUE.equals(applicant.getHasPaidAdmissionFee())) {
            throw new IllegalStateException("El postulante debe realizar el pago del examen de admisión primero");
        }

        // Validar que sea del programa de periodismo
        if (!"Periodismo".equalsIgnoreCase(applicant.getProgram().getName())) {
            throw new IllegalStateException("Este endpoint solo está disponible para postulantes de periodismo");
        }

        // Crear o actualizar el Score
        Score scoreEntity = applicant.getScore();
        if (scoreEntity == null) {
            scoreEntity = new Score();
            scoreEntity.setApplicant(applicant);
            applicant.setScore(scoreEntity);
        }

        // puntuación sin respuestas
        scoreEntity.setTotalScore(score);
        scoreEntity.setAnswers("");

        // Guardar los cambios
        scoreRepository.save(scoreEntity);

        // Verificar si el postulante aprobó según el puntaje mínimo requerido
        double minimumScore = applicant.getPerson().getEnrollmentMode().getMinimumScore();
        boolean isApproved = score >= minimumScore;

        //enviar correo de aprobación
        ApplicantUtils.sendScoreApprovalEmailIfNeeded(applicant, emailService, frontendBaseUrl);

        // Actualizar el estado del postulante
        applicant.setStatus(ApplicantStatus.UNDER_REVIEW);
        applicantRepository.save(applicant);

        // Buscar el periodo académico
        String academicPeriodName = academicPeriodRepository
                .findAcademicPeriodByDate(applicant.getRegistryDate())
                .map(AcademicPeriodProjection::getName)
                .orElse(applicant.getAcademicPeriodName());

        return new ApplicantScoreResponse(
                applicant.getCode(),
                applicant.getPerson().getName() + " " + applicant.getPerson().getLastname(),
                academicPeriodName,
                applicant.getProgram().getName(),
                scoreEntity.getTotalScore(),
                Arrays.asList(scoreEntity.getAnswers().split(";")),
                isApproved
        );
    }

    @Override
    public Optional<Exam> findNextAvailableExamForApplicant(Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado"));

        String programName = applicant.getProgram().getName().toLowerCase();
        boolean isInterview = programName.contains("periodismo") || programName.contains("comunicación audiovisual");

        if (isInterview) {
            return Optional.empty();
        }

        // encontrar examenes de admisión disponibles para la carrera del postulante
        List<Exam> exams = examRepository.findUpcomingExamsByProgramAndType(
                applicant.getProgram().getId(),
                ExamType.ADMISSION,
                LocalDateTime.now()
        );

        return exams.stream().findFirst();
    }

    @Override
    @Transactional
    public void assignNextExamToApplicant(Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado"));

        String programName = applicant.getProgram().getName().toLowerCase();
        boolean isInterview = programName.contains("periodismo") || programName.contains("comunicación audiovisual");

        if (isInterview) {
            return;
        }

        Optional<Exam> examOpt = findNextAvailableExamForApplicant(applicantId);
        if (examOpt.isEmpty()) {
            throw new IllegalStateException("No hay exámenes disponibles para la carrera " +
                    applicant.getProgram().getName() + ". Es necesario crear al menos un examen antes de proceder.");
        }

        applicant.setAssignedExam(examOpt.get());
        applicantRepository.save(applicant);
    }

    //metodos para el pago
    @Override
    @Transactional
    public void exonerateAdmissionPayment(Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado"));

        if (!Boolean.TRUE.equals(applicant.getDniValidated()) ||
                !Boolean.TRUE.equals(applicant.getCertificateValidated()) ||
                !Boolean.TRUE.equals(applicant.getPhotoValidated())) {
            throw new IllegalStateException("Todos los documentos deben estar validados antes de exonerar el pago");
        }

        // revisa si hay un examen disponible para la carrera del postulante
        String programName = applicant.getProgram().getName().toLowerCase();
        boolean isInterview = programName.contains("periodismo") || programName.contains("comunicación audiovisual");

        if (!isInterview) {
            Optional<Exam> examOpt = findNextAvailableExamForApplicant(applicantId);
            if (examOpt.isEmpty()) {
                throw new IllegalStateException("No hay exámenes de admisión programados para la carrera " +
                        applicant.getProgram().getName() + ". Es necesario crear al menos un examen antes de exonerar el pago.");
            }
        }

        // marcar como pagado la cuota de admision
        applicant.setHasPaidAdmissionFee(true);
        applicantRepository.save(applicant);

        if (isInterview) {
            // Crear cita con entrevistador disponible y enviar confirmación
            appointmentService.createAppointmentForApplicant(applicantId);
        } else {
            // Asignar examen y enviar info del examen
            assignNextExamToApplicant(applicantId);
            ApplicantUtils.sendAdmissionTestInfoEmail(applicant, emailService);
        }
    }

    @Override
    @Transactional
    public void generateCollection(Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new NotFoundException("Postulante no encontrado"));

        if (!Boolean.TRUE.equals(applicant.getDniValidated()) ||
                !Boolean.TRUE.equals(applicant.getCertificateValidated()) ||
                !Boolean.TRUE.equals(applicant.getPhotoValidated())) {
            throw new IllegalStateException("Todos los documentos deben estar validados antes de generar el cobro");
        }

        // Revisa si hay un examen disponible para la carrera del postulante
        String programName = applicant.getProgram().getName().toLowerCase();
        boolean isInterview = programName.contains("periodismo") || programName.contains("comunicación audiovisual");

        if (!isInterview) {
            Optional<Exam> examOpt = findNextAvailableExamForApplicant(applicantId);
            if (examOpt.isEmpty()) {
                throw new IllegalStateException("No hay exámenes de admisión programados para la carrera " +
                        applicant.getProgram().getName() + ". Es necesario crear al menos un examen antes de generar el cobro.");
            }
        }

        // enviar email de pago de examen de admision
        String paymentUrl = frontendBaseUrl + "/#/payment-receipt";
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", applicant.getPerson().getName());
        variables.put("paymentLink", paymentUrl);
        variables.put("logoUrl", "https://bausate.edu.pe/wp-content/uploads/2021/11/cropped-Logo_ico-180x180.png");
        emailService.send("document-approved", applicant.getPerson().getEmail(), variables);
    }


}
