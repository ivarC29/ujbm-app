package pe.edu.bausate.app.application.dto.interview;

import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.List;

import lombok.Data;

@Data
public class InterviewerCreateRequest {
    private String username;
    private String email;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<DayOfWeek> daysOfWeek;
    private Boolean recurring;
}