package pe.edu.bausate.app.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.bausate.app.application.dto.interview.InterviewerCreateRequest;
import pe.edu.bausate.app.application.dto.interview.InterviewerResponseDto;
import pe.edu.bausate.app.application.dto.interview.InterviewerSelectResponse;
import pe.edu.bausate.app.domain.models.InterviewerAvailability;
import pe.edu.bausate.app.domain.models.auth.Role;
import pe.edu.bausate.app.domain.models.auth.User;
import pe.edu.bausate.app.domain.repository.InterviewerAvailabilityRepository;
import pe.edu.bausate.app.domain.repository.RoleRepository;
import pe.edu.bausate.app.domain.repository.UserRepository;
import pe.edu.bausate.app.infraestructure.util.helper.UserUtils;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewerAvailabilityServiceImpl implements InterviewerAvailabilityService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final InterviewerAvailabilityRepository availabilityRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public InterviewerResponseDto createInterviewer(InterviewerCreateRequest request) {
        String password = UserUtils.generateRandomPassword();

        Role interviewerRole = roleRepository.findByName("ROLE_INTERVIEWER")
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        User user = User.builder()
                .username(request.getUsername().toLowerCase())
                .email(request.getEmail())
                .password(passwordEncoder.encode(password))
                .roles(Collections.singleton(interviewerRole))
                .enabled(true)
                .locked(false)
                .build();
        user.setRawPassword(password);
        User savedUser = userRepository.save(user);

        // Create an availability record for each day of the week
        if (request.getDaysOfWeek() != null && !request.getDaysOfWeek().isEmpty()) {
            for (DayOfWeek dayOfWeek : request.getDaysOfWeek()) {
                InterviewerAvailability availability = InterviewerAvailability.builder()
                        .interviewer(savedUser)
                        .startTime(request.getStartTime())
                        .endTime(request.getEndTime())
                        .dayOfWeek(dayOfWeek)
                        .recurring(request.getRecurring() != null ? request.getRecurring() : false)
                        .available(true)
                        .build();
                availabilityRepository.save(availability);
            }
        }

        // Map User to InterviewerResponseDto
        return mapToDto(savedUser);
    }

    @Override
    public List<InterviewerResponseDto> getAllInterviewers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> "ROLE_INTERVIEWER".equals(role.getName())))
                .filter(user -> Boolean.TRUE.equals(user.getEnabled()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public InterviewerResponseDto getInterviewerById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entrevistador no encontrado"));
        if (user.getRoles().stream().noneMatch(role -> "ROLE_INTERVIEWER".equals(role.getName()))) {
            throw new IllegalArgumentException("User no es un entrevistador");
        }
        return mapToDto(user);
    }

    @Override
    @Transactional
    public InterviewerResponseDto updateInterviewer(Long id, InterviewerCreateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entrevistador no encontrado"));
        if (user.getRoles().stream().noneMatch(role -> "ROLE_INTERVIEWER".equals(role.getName()))) {
            throw new IllegalArgumentException("User no es un entrevistador");
        }
        user.setUsername(request.getUsername().toLowerCase());
        user.setEmail(request.getEmail());
        userRepository.save(user);

        // Get all current availabilities for this interviewer
        List<InterviewerAvailability> existingAvailabilities = availabilityRepository.findAllByInterviewerId(id);

        // Delete all existing availabilities
        for (InterviewerAvailability availability : existingAvailabilities) {
            availabilityRepository.delete(availability);
        }

        // Create new availabilities for each day
        if (request.getDaysOfWeek() != null && !request.getDaysOfWeek().isEmpty()) {
            for (DayOfWeek dayOfWeek : request.getDaysOfWeek()) {
                InterviewerAvailability availability = InterviewerAvailability.builder()
                        .interviewer(user)
                        .startTime(request.getStartTime())
                        .endTime(request.getEndTime())
                        .dayOfWeek(dayOfWeek)
                        .recurring(request.getRecurring() != null ? request.getRecurring() : false)
                        .available(true)
                        .build();
                availabilityRepository.save(availability);
            }
        }

        return mapToDto(user);
    }

    @Override
    @Transactional
    public void deleteInterviewer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entrevistador no encontrado"));
        if (user.getRoles().stream().noneMatch(role -> "ROLE_INTERVIEWER".equals(role.getName()))) {
            throw new IllegalArgumentException("Usuario no es un entrevistador");
        }
        user.setEnabled(false);
        userRepository.save(user);

        //Set all availabilities to false
        List<InterviewerAvailability> availabilities = availabilityRepository.findAllByInterviewerId(id);
        for (InterviewerAvailability availability : availabilities) {
            availability.setAvailable(false);
            availabilityRepository.save(availability);
        }
    }

    @Override
    public List<InterviewerSelectResponse> findAllInterviewersForSelect() {
        List<User> interviewers = userRepository.findByRoleNameAndEnabledTrue("ROLE_INTERVIEWER");

        return interviewers.stream()
                .map(user -> {
                    String fullName = user.getPerson() != null
                            ? user.getPerson().getName() + " " + user.getPerson().getLastname()
                            : user.getUsername();
                    return new InterviewerSelectResponse(user.getId(), fullName);
                })
                .collect(Collectors.toList());
    }

    private InterviewerResponseDto mapToDto(User user) {
        InterviewerResponseDto dto = new InterviewerResponseDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setEnabled(user.getEnabled());
        return dto;
    }
}