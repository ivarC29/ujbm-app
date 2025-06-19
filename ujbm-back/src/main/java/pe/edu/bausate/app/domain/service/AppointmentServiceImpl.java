package pe.edu.bausate.app.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.bausate.app.application.dto.interview.AppointmentResponse;
import pe.edu.bausate.app.application.dto.interview.AppointmentUpdateRequest;
import pe.edu.bausate.app.application.service.email.EmailService;
import pe.edu.bausate.app.domain.enumerate.AppointmentStatus;
import pe.edu.bausate.app.domain.enumerate.ScheduleType;
import pe.edu.bausate.app.domain.models.Applicant;
import pe.edu.bausate.app.domain.models.Appointment;
import pe.edu.bausate.app.domain.models.InterviewerAvailability;
import pe.edu.bausate.app.domain.models.Schedule;
import pe.edu.bausate.app.domain.models.auth.User;
import pe.edu.bausate.app.domain.repository.ApplicantRepository;
import pe.edu.bausate.app.domain.repository.AppointmentRepository;
import pe.edu.bausate.app.domain.repository.InterviewerAvailabilityRepository;
import pe.edu.bausate.app.domain.repository.ScheduleRepository;
import pe.edu.bausate.app.infraestructure.exception.NotFoundException;
import pe.edu.bausate.app.infraestructure.util.SystemParameterKeys;
import pe.edu.bausate.app.infraestructure.util.helper.AppointmentUtils;
import pe.edu.bausate.app.infraestructure.util.helper.AppointmentUtils.AppointmentSlot;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ApplicantRepository applicantRepository;
    private final InterviewerAvailabilityRepository interviewerAvailabilityRepository;
    private final ScheduleRepository scheduleRepository;
    private final SystemParameterService systemParameterService;
    private final EmailService emailService;

    @Override
    @Transactional
    public AppointmentResponse createAppointmentForApplicant(Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new NotFoundException("Cita no encontrada con ID: " + applicantId));

        // ver si el applicant ya tiene una cita
        List<Appointment> existingAppointments = appointmentRepository.findByApplicantId(applicantId);
        if (!existingAppointments.isEmpty()) {
            log.info("Postulante ya encontrado con cita(s): {}", existingAppointments.size());
            Appointment existing = existingAppointments.get(0);
            if (existing.getAvailable()) {
                return mapToAppointmentResponse(existing);
            }
        }

        // system parameters
        Integer interviewDurationMinutes = AppointmentUtils.getInterviewDurationMinutes(systemParameterService);
        Integer maxAppointmentsPerDay = AppointmentUtils.getMaxAppointmentsPerDay(systemParameterService);
        String interviewLink = systemParameterService.get(SystemParameterKeys.INTERVIEW_LINK_URL) != null
                ? systemParameterService.get(SystemParameterKeys.INTERVIEW_LINK_URL).toString()
                : "https://meet.google.com"; // Default fallback URL


        List<InterviewerAvailability> allAvailabilities = interviewerAvailabilityRepository.findAllByAvailableTrue();
        // buscar siguiente slot disponible
        AppointmentSlot slot = AppointmentUtils.findNextAvailableSlot(
                allAvailabilities,
                appointmentRepository,
                interviewDurationMinutes,
                maxAppointmentsPerDay);

        if (slot == null) {
            throw new IllegalStateException("No hay slots disponibles para entrevistas en este momento.");
        }


        Schedule schedule = Schedule.builder()
                .name("Entrevistad@r para " + applicant.getPerson().getName() + " " + applicant.getPerson().getLastname())
                .startDateTime(slot.getStartTime())
                .endDateTime(slot.getEndTime())
                .location(interviewLink)
                .type(ScheduleType.INTERVIEW)
                .available(true)
                .build();
        scheduleRepository.save(schedule);

        // crear cita
        Appointment appointment = Appointment.builder()
                .schedule(schedule)
                .applicant(applicant)
                .interviewer(slot.getInterviewer())
                .status(AppointmentStatus.SCHEDULED)
                .available(true)
                .build();

        appointmentRepository.save(appointment);

        // enviar email de confirmacion
        AppointmentUtils.sendAppointmentConfirmationEmail(appointment, emailService, systemParameterService);

        return mapToAppointmentResponse(appointment);
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByApplicantId(Long applicantId) {
        return appointmentRepository.findByApplicantId(applicantId).stream()
                .filter(Appointment::getAvailable)
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse getAppointmentById(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Entrevista no encontrada con ID: " + appointmentId));
        return mapToAppointmentResponse(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointmentStatus(Long appointmentId, String statusCode) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Entrevista no encontrada con ID: " + appointmentId));

        AppointmentStatus newStatus = AppointmentStatus.fromCode(statusCode);
        appointment.setStatus(newStatus);

        return mapToAppointmentResponse(appointmentRepository.save(appointment));
    }

    @Override
@Transactional
public AppointmentResponse updateAppointment(Long appointmentId, AppointmentUpdateRequest request) {
    Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new NotFoundException("Entrevista no encontrada con ID: " + appointmentId));

    boolean scheduleChanged = false;

    // If providing a completely new schedule
    if (request.scheduleId() != null) {
        Schedule schedule = scheduleRepository.findById(request.scheduleId())
                .orElseThrow(() -> new NotFoundException("Horario no encontrado con ID: " + request.scheduleId()));
        appointment.setSchedule(schedule);
        scheduleChanged = true;
    }
    // If updating the existing schedule properties
    else if (request.startDateTime() != null || request.endDateTime() != null ||
             request.location() != null || request.scheduleName() != null) {

        Schedule schedule = appointment.getSchedule();

        if (request.startDateTime() != null) {
            schedule.setStartDateTime(request.startDateTime());
            scheduleChanged = true;
        }

        if (request.endDateTime() != null) {
            schedule.setEndDateTime(request.endDateTime());
            scheduleChanged = true;
        }

        if (request.location() != null) {
            schedule.setLocation(request.location());
            scheduleChanged = true;
        }

        if (request.scheduleName() != null) {
            schedule.setName(request.scheduleName());
        }

        // Check for scheduling conflicts with other appointments
        if (scheduleChanged) {
            AppointmentUtils.checkScheduleConflicts(
                schedule,
                appointment.getInterviewer().getId(),
                appointment.getId(),
                appointmentRepository
            );

            // Save the schedule updates
            scheduleRepository.save(schedule);
        }
    }

    if (request.interviewerId() != null) {
        User interviewer = interviewerAvailabilityRepository.findInterviewerById(request.interviewerId())
                .orElseThrow(() -> new NotFoundException("Entrevistador no encontrado con ID: " + request.interviewerId()));

        // If interviewer changed, check for conflicts with the schedule
        if (!interviewer.getId().equals(appointment.getInterviewer().getId())) {
            AppointmentUtils.checkScheduleConflicts(
                appointment.getSchedule(),
                interviewer.getId(),
                appointment.getId(),
                appointmentRepository
            );
            appointment.setInterviewer(interviewer);
            scheduleChanged = true;
        }
    }

    if (request.statusCode() != null && !request.statusCode().isEmpty()) {
        appointment.setStatus(AppointmentStatus.fromCode(request.statusCode()));
    }

    if (request.notes() != null) {
        appointment.setNotes(request.notes());
    }

    // Save the appointment
    appointmentRepository.save(appointment);

    // Send rescheduling notification if schedule was changed
    if (scheduleChanged) {
        AppointmentUtils.sendReschedulingNotification(appointment, emailService);
    }

    return mapToAppointmentResponse(appointment);
}
    @Override
    @Transactional
    public AppointmentResponse addNotesToAppointment(Long appointmentId, String notes) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Entrevista no encontrada con ID: " + appointmentId));

        appointment.setNotes(notes);

        return mapToAppointmentResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public void cancelAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Entrevista no encontrada : " + appointmentId));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setAvailable(false);

        appointmentRepository.save(appointment);

        // liberar schedule
        Schedule schedule = appointment.getSchedule();
        schedule.setAvailable(false);
        scheduleRepository.save(schedule);

        // email de cancelacion
        AppointmentUtils.sendAppointmentCancellationEmail(appointment, emailService);
    }

    private AppointmentResponse mapToAppointmentResponse(Appointment appointment) {
        Schedule schedule = appointment.getSchedule();
        Applicant applicant = appointment.getApplicant();
        User interviewer = appointment.getInterviewer();

        return new AppointmentResponse(
                appointment.getId(),
                schedule.getId(),
                schedule.getStartDateTime(),
                schedule.getEndDateTime(),
                applicant.getId(),
                applicant.getCode(),
                applicant.getPerson().getName() + " " + applicant.getPerson().getLastname(),
                interviewer.getId(),
                interviewer.getPerson() != null
                        ? interviewer.getPerson().getName() + " " + interviewer.getPerson().getLastname()
                        : interviewer.getUsername(),
                appointment.getStatus().getDisplayName(),
                appointment.getNotes()
        );
    }
}