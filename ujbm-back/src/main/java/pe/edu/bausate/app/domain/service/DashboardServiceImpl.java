package pe.edu.bausate.app.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.bausate.app.application.dto.dashboard.ChartDataDTO;
import pe.edu.bausate.app.application.dto.dashboard.DashboardFilterRequest;
import pe.edu.bausate.app.domain.models.projection.ChartProjection;
import pe.edu.bausate.app.domain.repository.DashboardApplicantRepository;

import java.util.List;


@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final DashboardApplicantRepository repository;

    @Override
    public List<ChartDataDTO> getChartData(DashboardFilterRequest filter) {
        String dimension = filter.getChartDimension();
        String gender = filter.getGender() != null ? filter.getGender().getCode() : null;
        Integer ageFrom = filter.getAgeFrom();
        Integer ageTo = filter.getAgeTo();
        String applicantType = filter.getApplicantType() != null ? filter.getApplicantType().getCode() : null;
        String departmentCode = filter.getDepartmentCode();
        String provinceCode = filter.getProvinceCode();
        String districtCode = filter.getDistrictCode();
        String schoolType = filter.getSchoolType() != null ? filter.getSchoolType().getCode() : null;
        String status = filter.getStatus() != null ? filter.getStatus().getCode() : null;
        java.time.LocalDate dateFrom = filter.getRegistrationDateFrom();
        java.time.LocalDate dateTo = filter.getRegistrationDateTo();
        Double scoreFrom = filter.getScoreFrom();
        Double scoreTo = filter.getScoreTo();
        Long programId = filter.getProgramId();
        String contactMethod = filter.getContactMethod() != null ? filter.getContactMethod().getCode() : null;
        String disabilityType = filter.getDisabilityType() != null ? filter.getDisabilityType().getCode() : null;
        String academicPeriod = filter.getAcademicPeriod();

        List<ChartProjection> projections;

        switch (dimension) {
            case "gender":
                projections = repository.getChartByGender(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo, programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            case "applicantType":
                projections = repository.getChartByApplicantType(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo, programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            case "schoolType":
                projections = repository.getChartBySchoolType(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo, programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            case "contactMethod":
                projections = repository.getChartByContactMethod(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo,programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            case "disability":
                projections = repository.getChartByDisabilityType(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo, programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            case "age":
                projections = repository.getChartByAge(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo, programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            case "score":
                projections = repository.getChartByScore(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo, programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            case "department":
                projections = repository.getChartByDepartment(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo, programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            case "province":
                projections = repository.getChartByProvince(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo, programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            case "district":
                projections = repository.getChartByDistrict(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo, programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            case "status":
                projections = repository.getChartByStatus(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo, programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            case "program":
                projections = repository.getChartByProgram(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo, programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            case "academicPeriod":
                projections = repository.getChartByAcademicPeriod(
                        gender, ageFrom, ageTo, applicantType, departmentCode, provinceCode, districtCode,
                        schoolType, status, dateFrom, dateTo, scoreFrom, scoreTo, programId, contactMethod, disabilityType, academicPeriod
                );
                break;
            default:
                projections = List.of();
                break;
        }

        return projections.stream()
                .map(p -> new ChartDataDTO(p.getName(), p.getValue()))
                .toList();
    }
}