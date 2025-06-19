package pe.edu.bausate.app.application.dto.teacher;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import pe.edu.bausate.app.application.dto.PersonResponse;

import java.time.LocalDate;

@Schema(description = "DTO for teacher response")
public record TeacherResponse(
        @Schema(description = "Unique identifier of the teacher", example = "1")
        Long id,

        @Schema(description = "Person information")
        PersonResponse person,

        @Schema(description = "Teacher's professional title", example = "PhD in Computer Science")
        String professionalTitle,

        @Schema(description = "Teacher's academic degree", example = "Master")
        String academicDegree,

        @Schema(description = "Date when the teacher was hired", example = "15/03/2022")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
        LocalDate hireDate,

        @Schema(description = "Whether the teacher is full-time", example = "true")
        Boolean isFullTime
) {}
