package pe.edu.bausate.app.domain.service;

import pe.edu.bausate.app.application.dto.UbigeoSelectDTO;

import java.util.List;

public interface UbigeoService {
    List<UbigeoSelectDTO> getDepartments();
    List<UbigeoSelectDTO> getProvincesByDepartment(String departmentCode);
    List<UbigeoSelectDTO> getDistrictsByDepartmentAndProvince(String departmentCode, String provinceCode);
}
