package pe.edu.bausate.app.application.dto.interview;

import lombok.Data;

@Data
public class InterviewerResponseDto {
    private Long id;
    private String username;
    private String email;
    private Boolean enabled;
}