package pe.edu.bausate.app.infraestructure.util.helper;

import lombok.extern.slf4j.Slf4j;
import pe.edu.bausate.app.application.service.email.EmailService;
import pe.edu.bausate.app.domain.models.Applicant;
import pe.edu.bausate.app.domain.models.Appointment;
import pe.edu.bausate.app.domain.models.InterviewerAvailability;
import pe.edu.bausate.app.domain.models.Schedule;
import pe.edu.bausate.app.domain.models.auth.User;
import pe.edu.bausate.app.domain.repository.AppointmentRepository;
import pe.edu.bausate.app.domain.service.SystemParameterService;
import pe.edu.bausate.app.infraestructure.util.SystemParameterKeys;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
public class AppointmentUtils {

    public static Integer getInterviewDurationMinutes(SystemParameterService systemParameterService) {
        Object value = systemParameterService.get(SystemParameterKeys.INTERVIEW_DURATION_MINUTES);
        if (value == null) {
            return 30; // Default value
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            log.error("Valor de entrevista invalido: {}", value);
            return 30;
        }
    }

    public static Integer getMaxAppointmentsPerDay(SystemParameterService systemParameterService) {
        Object value = systemParameterService.get(SystemParameterKeys.INTERVIEW_MAX_APPOINTMENTS_PER_DAY);
        if (value == null) {
            return 5; // Default value
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            log.error("Invalido maximo de citas por dia: {}", value);
            return 5;
        }
    }

    public static AppointmentSlot findNextAvailableSlot(
            List<InterviewerAvailability> allAvailabilities,
            AppointmentRepository appointmentRepository,
            int durationMinutes,
            int maxPerDay) {

        // Start looking from tomorrow
        LocalDate startDate = LocalDate.now().plusDays(1);

        // Look for available slots in the next 30 days
        for (int dayOffset = 0; dayOffset < 30; dayOffset++) {
            LocalDate currentDate = startDate.plusDays(dayOffset);
            DayOfWeek dayOfWeek = currentDate.getDayOfWeek();

            // Find interviewers available on this day of week
            List<InterviewerAvailability> availabilities = allAvailabilities.stream()
                    .filter(ia -> isAvailableOnDay(ia, dayOfWeek, currentDate))
                    .collect(Collectors.toList());

            if (availabilities.isEmpty()) {
                continue; // No interviewers available on this day
            }

            // Count existing appointments for this day
            LocalDateTime dayStart = currentDate.atStartOfDay();
            LocalDateTime dayEnd = currentDate.plusDays(1).atStartOfDay();

            int existingAppointments = appointmentRepository.countAppointmentsByDateRange(dayStart, dayEnd);

            if (existingAppointments >= maxPerDay) {
                continue; // Max appointments reached for this day
            }

            // Find the first available slot
            for (InterviewerAvailability availability : availabilities) {
                Optional<AppointmentSlot> slot = findSlotInAvailability(
                        availability,
                        currentDate,
                        durationMinutes,
                        appointmentRepository);
                if (slot.isPresent()) {
                    return slot.get();
                }
            }
        }

        return null; // No available slots found
    }

    public static boolean isAvailableOnDay(
            InterviewerAvailability availability,
            DayOfWeek dayOfWeek,
            LocalDate date) {

        // Check if available for recurring weekly schedule
        if (availability.getRecurring() && availability.getDayOfWeek() == dayOfWeek) {
            return true;
        }

        // Check for specific date availability
        if (!availability.getRecurring()) {
            LocalDate availabilityDate = availability.getStartTime().toLocalDate();
            return availabilityDate.equals(date);
        }

        return false;
    }

    public static Optional<AppointmentSlot> findSlotInAvailability(
            InterviewerAvailability availability,
            LocalDate date,
            int durationMinutes,
            AppointmentRepository appointmentRepository) {

        LocalTime startTime;
        LocalTime endTime;

        if (availability.getRecurring()) {
            // For recurring availability, use the time part only
            startTime = availability.getStartTime().toLocalTime();
            endTime = availability.getEndTime().toLocalTime();
        } else {
            // For specific date availability
            if (!availability.getStartTime().toLocalDate().equals(date)) {
                return Optional.empty();
            }
            startTime = availability.getStartTime().toLocalTime();
            endTime = availability.getEndTime().toLocalTime();
        }

        LocalDateTime slotStart = date.atTime(startTime);
        LocalDateTime slotEnd = slotStart.plusMinutes(durationMinutes);

        if (slotEnd.toLocalTime().isAfter(endTime)) {
            return Optional.empty(); // Not enough time in the availability
        }

        // Check if there are any existing appointments that overlap with this slot
        List<Appointment> existingAppointments = appointmentRepository.findByInterviewerAndDateRange(
                availability.getInterviewer().getId(),
                date.atStartOfDay(),
                date.plusDays(1).atStartOfDay());

        boolean slotAvailable = existingAppointments.stream()
                .noneMatch(a -> {
                    LocalDateTime apptStart = a.getSchedule().getStartDateTime();
                    LocalDateTime apptEnd = a.getSchedule().getEndDateTime();
                    return (slotStart.isBefore(apptEnd) && slotEnd.isAfter(apptStart));
                });

        if (slotAvailable) {
            return Optional.of(new AppointmentSlot(
                    availability.getInterviewer(),
                    slotStart,
                    slotEnd
            ));
        }

        return Optional.empty();
    }

    public static void checkScheduleConflicts(
            Schedule schedule,
            Long interviewerId,
            Long currentAppointmentId,
            AppointmentRepository appointmentRepository) {

        LocalDateTime newStart = schedule.getStartDateTime();
        LocalDateTime newEnd = schedule.getEndDateTime();

        // Find all appointments for this interviewer in a wider time range
        LocalDateTime bufferStart = newStart.minusHours(1);
        LocalDateTime bufferEnd = newEnd.plusHours(1);

        List<Appointment> existingAppointments = appointmentRepository.findByInterviewerAndDateRange(
                interviewerId, bufferStart, bufferEnd);

        // Filter out the current appointment being updated
        existingAppointments = existingAppointments.stream()
                .filter(a -> !a.getId().equals(currentAppointmentId))
                .collect(Collectors.toList());

        // Check for direct conflicts
        for (Appointment existing : existingAppointments) {
            LocalDateTime existingStart = existing.getSchedule().getStartDateTime();
            LocalDateTime existingEnd = existing.getSchedule().getEndDateTime();

            if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) {
                throw new IllegalStateException("La cita programada se solapa con otra cita existente para este entrevistador.");
            }

            // Check if appointments are too close
            if (Math.abs(newStart.until(existingEnd, java.time.temporal.ChronoUnit.MINUTES)) < 15 ||
                    Math.abs(newEnd.until(existingStart, java.time.temporal.ChronoUnit.MINUTES)) < 15) {
                throw new IllegalStateException("La cita está demasiado cerca de otra cita existente. Debe haber al menos 15 minutos entre citas.");
            }
        }
    }

    public static void sendReschedulingNotification(
            Appointment appointment,
            EmailService emailService) {

        Applicant applicant = appointment.getApplicant();
        Schedule schedule = appointment.getSchedule();

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("EEEE, dd 'de' MMMM 'de' yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", applicant.getPerson().getName());
        variables.put("date", schedule.getStartDateTime().format(dateFormatter));
        variables.put("startTime", schedule.getStartDateTime().format(timeFormatter));
        variables.put("endTime", schedule.getEndDateTime().format(timeFormatter));
        variables.put("interviewer", appointment.getInterviewer().getPerson() != null
                ? appointment.getInterviewer().getPerson().getName() + " " + appointment.getInterviewer().getPerson().getLastname()
                : appointment.getInterviewer().getUsername());
        variables.put("logoUrl", "https://bausate.edu.pe/wp-content/uploads/2021/11/cropped-Logo_ico-180x180.png");

        emailService.send("interview-rescheduled", applicant.getPerson().getEmail(), variables);
    }

    public static void sendAppointmentConfirmationEmail(
            Appointment appointment,
            EmailService emailService,
            SystemParameterService systemParameterService) {

        Applicant applicant = appointment.getApplicant();
        Schedule schedule = appointment.getSchedule();
        User interviewer = appointment.getInterviewer();

        String interviewLink = systemParameterService.get(SystemParameterKeys.INTERVIEW_LINK_URL) != null
                ? systemParameterService.get(SystemParameterKeys.INTERVIEW_LINK_URL).toString()
                : "https://meet.google.com";

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("EEEE, dd 'de' MMMM 'de' yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", applicant.getPerson().getName());
        variables.put("startDateTime", schedule.getStartDateTime());
        variables.put("endDateTime", schedule.getEndDateTime());
        variables.put("interviewerName", interviewer.getPerson() != null
                ? interviewer.getPerson().getName() + " " + interviewer.getPerson().getLastname()
                : interviewer.getUsername());
        variables.put("location", interviewLink);
        variables.put("logoUrl", "https://bausate.edu.pe/wp-content/uploads/2021/11/cropped-Logo_ico-180x180.png");

        emailService.send("interview-appointment", applicant.getPerson().getEmail(), variables);
    }

    public static void sendAppointmentCancellationEmail(
            Appointment appointment,
            EmailService emailService) {

        Applicant applicant = appointment.getApplicant();
        Schedule schedule = appointment.getSchedule();


        Map<String, Object> variables = new HashMap<>();
        variables.put("name", applicant.getPerson().getName());
        variables.put("startDateTime", schedule.getStartDateTime());
        variables.put("endDateTime", schedule.getEndDateTime());
        variables.put("logoUrl", "https://bausate.edu.pe/wp-content/uploads/2021/11/cropped-Logo_ico-180x180.png");

        emailService.send("interview-cancellation", applicant.getPerson().getEmail(), variables);
    }

    // Inner class to represent an appointment slot
    public static class AppointmentSlot {
        private final User interviewer;
        private final LocalDateTime startTime;
        private final LocalDateTime endTime;

        public AppointmentSlot(User interviewer, LocalDateTime startTime, LocalDateTime endTime) {
            this.interviewer = interviewer;
            this.startTime = startTime;
            this.endTime = endTime;
        }

        public User getInterviewer() {
            return interviewer;
        }

        public LocalDateTime getStartTime() {
            return startTime;
        }

        public LocalDateTime getEndTime() {
            return endTime;
        }
    }
}
