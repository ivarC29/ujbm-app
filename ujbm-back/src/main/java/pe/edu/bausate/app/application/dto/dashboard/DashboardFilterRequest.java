package pe.edu.bausate.app.application.dto.dashboard;


import lombok.Data;
import pe.edu.bausate.app.domain.enumerate.*;

import java.time.LocalDate;

@Data
public class DashboardFilterRequest {
    private String chartDimension;
    private Gender gender;
    private Integer ageFrom;
    private Integer ageTo;
    private EnrollmentMode applicantType;
    private String departmentCode;
    private String provinceCode;
    private String districtCode;
    private HighSchoolType schoolType;
    private ApplicantStatus status;
    private LocalDate registrationDateFrom;
    private LocalDate registrationDateTo;
    private Double scoreFrom;
    private Double scoreTo;
    private Long programId;
    private AwarenessMethod contactMethod;
    private DisabilityType disabilityType;
    private String academicPeriod;
}