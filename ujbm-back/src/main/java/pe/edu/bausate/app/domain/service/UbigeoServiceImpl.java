package pe.edu.bausate.app.domain.service;

import lombok.RequiredArgsConstructor;
import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import pe.edu.bausate.app.application.dto.UbigeoSelectDTO;
import pe.edu.bausate.app.application.dto.UbigeoSelectResponse;
import org.springframework.stereotype.Service;
import pe.edu.bausate.app.domain.repository.UbigeoRepository;

@Service
@RequiredArgsConstructor
public class UbigeoServiceImpl implements UbigeoService {
    private final UbigeoRepository ubigeoRepository;

    @Override
    @Cacheable(value = "departments")
    public List<UbigeoSelectDTO> getDepartments() {
        return ubigeoRepository.findAllDepartments()
                .stream()
                .map(p -> UbigeoSelectDTO.builder()
                        .code(p.getCode())
                        .name(p.getName())
                        .build())
                .toList();
    }

    @Override
    @Cacheable(value = "provinces", key = "#departmentCode")
    public List<UbigeoSelectDTO> getProvincesByDepartment(String departmentCode) {
        return ubigeoRepository.findProvincesByDepartment(departmentCode)
                .stream()
                .map(p -> new UbigeoSelectDTO(p.getCode(), p.getName()))
                .toList();
    }

    @Override
    @Cacheable(value = "districts", key = "#departmentCode + '-' + #provinceCode")
    public List<UbigeoSelectDTO> getDistrictsByDepartmentAndProvince(String departmentCode, String provinceCode) {
        return ubigeoRepository.findDistrictsByDepartmentAndProvince(departmentCode, provinceCode)
                .stream()
                .map(p -> new UbigeoSelectDTO(p.getCode(), p.getName()))
                .toList();
    }
}
