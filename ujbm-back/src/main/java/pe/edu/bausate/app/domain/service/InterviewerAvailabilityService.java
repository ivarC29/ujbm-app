package pe.edu.bausate.app.domain.service;

import pe.edu.bausate.app.application.dto.interview.InterviewerCreateRequest;
import pe.edu.bausate.app.application.dto.interview.InterviewerResponseDto;
import pe.edu.bausate.app.application.dto.interview.InterviewerSelectResponse;

import java.util.List;

public interface InterviewerAvailabilityService {
    InterviewerResponseDto createInterviewer(InterviewerCreateRequest request);
    List<InterviewerResponseDto> getAllInterviewers();
    InterviewerResponseDto getInterviewerById(Long id);
    InterviewerResponseDto updateInterviewer(Long id, InterviewerCreateRequest request);
    void deleteInterviewer(Long id);
    List<InterviewerSelectResponse> findAllInterviewersForSelect();
}
