package pe.edu.bausate.app.domain.service;

import pe.edu.bausate.app.application.dto.interview.AppointmentResponse;
import pe.edu.bausate.app.application.dto.interview.AppointmentUpdateRequest;
import pe.edu.bausate.app.domain.models.Applicant;

import java.util.List;

public interface AppointmentService {
    AppointmentResponse createAppointmentForApplicant(Long applicantId);
    List<AppointmentResponse> getAppointmentsByApplicantId(Long applicantId);
    AppointmentResponse getAppointmentById(Long appointmentId);
    AppointmentResponse updateAppointmentStatus(Long appointmentId, String statusCode);
    AppointmentResponse addNotesToAppointment(Long appointmentId, String notes);
    void cancelAppointment(Long appointmentId);

    AppointmentResponse updateAppointment(Long appointmentId, AppointmentUpdateRequest request);
}