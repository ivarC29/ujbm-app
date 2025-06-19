package pe.edu.bausate.app.domain.service;

import pe.edu.bausate.app.application.dto.AcademicPeriodSelectResponse;

import java.util.List;

public interface AcademicPeriodService {
    List<AcademicPeriodSelectResponse> getAllForSelect();
}
