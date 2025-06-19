package pe.edu.bausate.app.application.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pe.edu.bausate.app.application.dto.UbigeoSelectDTO;
import pe.edu.bausate.app.application.dto.UbigeoSelectResponse;
import pe.edu.bausate.app.domain.models.projection.UbigeoSelectProjection;
import pe.edu.bausate.app.domain.service.UbigeoService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.UBIGEO_PUBLIC)
@RequiredArgsConstructor
public class UbigeoPublicController {
    private final UbigeoService ubigeoService;

    @GetMapping("/departments")
    public List<UbigeoSelectDTO> getDepartments() {
        return ubigeoService.getDepartments();
    }

    @GetMapping("/provinces")
    public List<UbigeoSelectDTO> getProvinces(@RequestParam String departmentCode) {
        return ubigeoService.getProvincesByDepartment(departmentCode);
    }

    @GetMapping("/districts")
    public List<UbigeoSelectDTO> getDistricts(
            @RequestParam String departmentCode,
            @RequestParam String provinceCode) {
        return ubigeoService.getDistrictsByDepartmentAndProvince(departmentCode, provinceCode);
    }
}
