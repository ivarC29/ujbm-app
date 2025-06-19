package pe.edu.bausate.app.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.bausate.app.application.dto.AcademicPeriodSelectResponse;
import pe.edu.bausate.app.domain.repository.AcademicPeriodRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AcademicPeriodServiceImpl implements AcademicPeriodService{
    private final AcademicPeriodRepository academicPeriodRepository;

    @Override
    public List<AcademicPeriodSelectResponse> getAllForSelect() {
        return academicPeriodRepository.findAllByOrderByStartDateDescAvailable()
                .stream()
                .map(p -> new AcademicPeriodSelectResponse(p.getId(), p.getName()))
                .toList();
    }
}
