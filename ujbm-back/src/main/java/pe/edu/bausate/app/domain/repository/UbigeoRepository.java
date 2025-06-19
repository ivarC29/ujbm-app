package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.edu.bausate.app.domain.models.projection.UbigeoSelectProjection;
import pe.edu.bausate.app.domain.models.Ubigeo;

import java.util.List;
import java.util.Optional;

public interface UbigeoRepository extends JpaRepository<Ubigeo, Long> {
    @Query("SELECT u.id FROM Ubigeo u")
    List<Long> findAllIds();

    @Query("SELECT DISTINCT u.departmentCode AS code, u.departmentName AS name FROM Ubigeo u")
    List<UbigeoSelectProjection> findAllDepartments();

    @Query("SELECT DISTINCT u.provinceCode AS code, u.provinceName AS name FROM Ubigeo u WHERE u.departmentCode = :departmentCode")
    List<UbigeoSelectProjection> findProvincesByDepartment(String departmentCode);

    @Query("SELECT u.districtCode AS code, u.districtName AS name FROM Ubigeo u WHERE u.departmentCode = :departmentCode AND u.provinceCode = :provinceCode")
    List<UbigeoSelectProjection> findDistrictsByDepartmentAndProvince(String departmentCode, String provinceCode);

    @Query("SELECT u FROM Ubigeo u WHERE u.departmentCode = :departmentCode AND u.provinceCode = :provinceCode AND u.districtCode = :districtCode")
    Optional<Ubigeo> findByCodes(String departmentCode, String provinceCode, String districtCode);
}
