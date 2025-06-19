package pe.edu.bausate.app.domain.service.scheduler;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;
import pe.edu.bausate.app.application.service.email.EmailService;
import pe.edu.bausate.app.domain.models.Applicant;
import pe.edu.bausate.app.domain.repository.ApplicantRepository;
import pe.edu.bausate.app.domain.service.SystemParameterService;
import pe.edu.bausate.app.infraestructure.util.SystemParameterKeys;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;


@Service
@RequiredArgsConstructor
@Slf4j
public class OneTimeTaskSchedulerService {

    private final SystemParameterService systemParameterService;
    private final ApplicantRepository applicantRepository;
    private final EmailService emailService;
    private final TaskScheduler taskScheduler;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @PostConstruct
    public void scheduleTask() {
        try {
            String cronExpression = (String) systemParameterService.get(SystemParameterKeys.ADMISSION_EXAM_HOUR_SEND);
            if (cronExpression == null || cronExpression.isEmpty()) {
                log.warn("No hay cron expression configurado para el envio de emails");
                return;
            }

            log.info("Scheduling tarea con cron: {}", cronExpression);
            Runnable task = this::sendAdmissionApprovedEmails;
            taskScheduler.schedule(task, new CronTrigger(cronExpression, TimeZone.getTimeZone("America/Lima")));
            log.info("Email sending task programado satisfactoriamente");
        } catch (Exception e) {
            log.error("Fallo en scheduled emails: {}", e.getMessage());

        }
    }

    public void sendAdmissionApprovedEmails() {
        Object sendDateObj = systemParameterService.get(SystemParameterKeys.ADMISSION_EXAM_MAIL_SEND_DATE);
        if (sendDateObj == null) {
            log.warn("No send date configurado");
            return;
        }

        LocalDate sendDate;
        if (sendDateObj instanceof LocalDate) {
            sendDate = (LocalDate) sendDateObj;
        } else {
            try {
                sendDate = LocalDate.parse(sendDateObj.toString());
            } catch (Exception e) {
                log.error("Formato de fecha inválido: {}", sendDateObj);
                return;
            }
        }

        LocalDate today = LocalDate.now(ZoneId.of("America/Lima"));
        log.info("Fecha de envio de emails: {}, hoy: {}", sendDate, today);

        if (!today.equals(sendDate)) {
            log.info("Hoy no es la fecha de envio de emails, no se enviaran emails");
            return;
        }

        String currentPeriod = (String) systemParameterService.get(SystemParameterKeys.CURRENT_ACADEMIC_PERIOD);
        List<Applicant> applicants = applicantRepository.findAllByAvailableTrueAndAcademicPeriodName(currentPeriod);

        int emailsSent = 0;
        for (Applicant applicant : applicants) {
            if (applicant.getScore() == null) {
                log.debug("Postulante {} no tiene score", applicant.getCode());
                continue;
            }

            if (Boolean.TRUE.equals(applicant.getAdmissionApprovalEmailSent())) {
                log.debug("Applicant {} ya recivio approval email", applicant.getCode());
                continue;
            }

            double minScore = applicant.getPerson().getEnrollmentMode().getMinimumScore();
            if (applicant.getScore().getTotalScore() < minScore) {
                log.debug("Postulante {} score {} es menor al minimo {}",
                        applicant.getCode(), applicant.getScore().getTotalScore(), minScore);
                continue;
            }

            try {
                // Send email
                String paymentUrl = frontendBaseUrl + "/#/payment-receipt";
                Map<String, Object> variables = new HashMap<>();
                variables.put("name", applicant.getPerson().getName());
                variables.put("paymentLink", paymentUrl);
                variables.put("logoUrl", "https://bausate.edu.pe/wp-content/uploads/2021/11/cropped-Logo_ico-180x180.png");

                emailService.send("admission-approved", applicant.getPerson().getEmail(), variables);

                // Update and save
                applicant.setAdmissionApprovalEmailSent(true);
                applicantRepository.save(applicant);
                emailsSent++;

                Thread.sleep(2000); // delay de 2 s
            } catch (Exception e) {
                log.error("Error enviando email applicant {}: {}", applicant.getCode(), e.getMessage(), e);
            }
        }

        log.info("Completado envio de emails: enviado {} emails para date {}", emailsSent, sendDate);
    }
}