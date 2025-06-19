package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.bausate.app.domain.models.Applicant;
import pe.edu.bausate.app.domain.models.projection.ChartProjection;

import java.time.LocalDate;
import java.util.List;

public interface DashboardApplicantRepository extends JpaRepository<Applicant, Long> {

    @Query(nativeQuery = true, value = """
        SELECT 
            CASE 
                WHEN p.gender IS NULL THEN 'No especificado' 
                WHEN p.gender = '1' THEN 'Masculino'
                WHEN p.gender = '2' THEN 'Femenino'
                ELSE 'Otro'
            END AS name, 
            COUNT(*) AS value
        FROM applicant a
        JOIN person p ON a.person_id = p.id
        LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
        LEFT JOIN high_school_info hs ON a.high_school_info_id = hs.id
        LEFT JOIN program pr ON a.program_id = pr.id
        LEFT JOIN score s ON a.id = s.applicant_id                  
        WHERE (:gender IS NULL OR p.gender = :gender)
          AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
          AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
          AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
          AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
          AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
          AND (:districtCode IS NULL OR u.district_code = :districtCode)
          AND (:schoolType IS NULL OR hs.type = :schoolType)
          AND (:status IS NULL OR a.status = :status)
          AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
          AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
          AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
          AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
          AND (:programId IS NULL OR a.program_id = :programId)
          AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
          AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
          AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
          AND a.available = 1
        GROUP BY 
            CASE 
                WHEN p.gender IS NULL THEN 'No especificado' 
                WHEN p.gender = '1' THEN 'Masculino'
                WHEN p.gender = '2' THEN 'Femenino'
                ELSE 'Otro'
            END
        ORDER BY value DESC
    """)
    List<ChartProjection> getChartByGender(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );

    @Query(nativeQuery = true, value = """
        SELECT 
            CASE 
                WHEN p.enrollment_mode = '01' THEN 'Examen ordinario'
                WHEN p.enrollment_mode = '02' THEN 'Evaluación preferente'
                WHEN p.enrollment_mode = '03' THEN 'Exonerados'
                WHEN p.enrollment_mode = '04' THEN 'Traslado'
                WHEN p.enrollment_mode = '05' THEN 'Pre Bausate'
                ELSE 'No matriculado'
            END AS name, 
            COUNT(*) AS value
        FROM applicant a
        JOIN person p ON a.person_id = p.id
        LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
        LEFT JOIN high_school_info hs ON a.high_school_info_id = hs.id
        LEFT JOIN program pr ON a.program_id = pr.id
        LEFT JOIN score s ON a.id = s.applicant_id
        WHERE (:gender IS NULL OR p.gender = :gender)
          AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
          AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
          AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
          AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
          AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
          AND (:districtCode IS NULL OR u.district_code = :districtCode)
          AND (:schoolType IS NULL OR hs.type = :schoolType)
          AND (:status IS NULL OR a.status = :status)
          AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
          AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
          AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
          AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
          AND (:programId IS NULL OR a.program_id = :programId)
          AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
          AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
          AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
          AND a.available = 1
        GROUP BY 
            CASE 
                WHEN p.enrollment_mode = '01' THEN 'Examen ordinario'
                WHEN p.enrollment_mode = '02' THEN 'Evaluación preferente'
                WHEN p.enrollment_mode = '03' THEN 'Exonerados'
                WHEN p.enrollment_mode = '04' THEN 'Traslado'
                WHEN p.enrollment_mode = '05' THEN 'Pre Bausate'
                ELSE 'No matriculado'
            END
        ORDER BY value DESC
    """)
    List<ChartProjection> getChartByApplicantType(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );

// Department
    @Query(nativeQuery = true, value = """
    SELECT
        u.department_name AS name,
        COUNT(*) AS value
    FROM applicant a
    JOIN person p ON a.person_id = p.id
    LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
    LEFT JOIN high_school_info hs ON a.high_school_info_id = hs.id
    LEFT JOIN program pr ON a.program_id = pr.id
    LEFT JOIN score s ON a.id = s.applicant_id                                
    WHERE (:gender IS NULL OR p.gender = :gender)
      AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
      AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
      AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
      AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
      AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
      AND (:districtCode IS NULL OR u.district_code = :districtCode)
      AND (:schoolType IS NULL OR hs.type = :schoolType)
      AND (:status IS NULL OR a.status = :status)
      AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
      AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
      AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
      AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
      AND (:programId IS NULL OR a.program_id = :programId)
      AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
      AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
      AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
      AND a.available = 1
    GROUP BY u.department_name
    ORDER BY value DESC
""")
    List<ChartProjection> getChartByDepartment(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );

    // Province
    @Query(nativeQuery = true, value = """
    SELECT
        u.province_name AS name,
        COUNT(*) AS value
    FROM applicant a
    JOIN person p ON a.person_id = p.id
    LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
    LEFT JOIN high_school_info hs ON a.high_school_info_id = hs.id
    LEFT JOIN program pr ON a.program_id = pr.id
    LEFT JOIN score s ON a.id = s.applicant_id                  
    WHERE (:gender IS NULL OR p.gender = :gender)
      AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
      AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
      AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
      AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
      AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
      AND (:districtCode IS NULL OR u.district_code = :districtCode)
      AND (:schoolType IS NULL OR hs.type = :schoolType)
      AND (:status IS NULL OR a.status = :status)
      AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
      AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
      AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
      AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
      AND (:programId IS NULL OR a.program_id = :programId)
      AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
      AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
      AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
      AND a.available = 1
    GROUP BY u.province_name
    ORDER BY value DESC
""")
    List<ChartProjection> getChartByProvince(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );

    // District
    @Query(nativeQuery = true, value = """
    SELECT
        u.district_name AS name,
        COUNT(*) AS value
    FROM applicant a
    JOIN person p ON a.person_id = p.id
    LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
    LEFT JOIN high_school_info hs ON a.high_school_info_id = hs.id
    LEFT JOIN program pr ON a.program_id = pr.id
    LEFT JOIN score s ON a.id = s.applicant_id
    WHERE (:gender IS NULL OR p.gender = :gender)
      AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
      AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
      AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
      AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
      AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
      AND (:districtCode IS NULL OR u.district_code = :districtCode)
      AND (:schoolType IS NULL OR hs.type = :schoolType)
      AND (:status IS NULL OR a.status = :status)
      AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
      AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
      AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
      AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
      AND (:programId IS NULL OR a.program_id = :programId)
      AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
      AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
      AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
      AND a.available = 1
    GROUP BY u.district_name
    ORDER BY value DESC
""")
    List<ChartProjection> getChartByDistrict(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );

    @Query(nativeQuery = true, value = """
    SELECT
        CASE
            WHEN a.status = '01' THEN 'Pendiente'
            WHEN a.status = '02' THEN 'Aprobado'
            WHEN a.status = '03' THEN 'Rechazado'
            WHEN a.status = '04' THEN 'En revisión'
            WHEN a.status = '05' THEN 'Incompleta'
            ELSE 'Desconocido'
        END AS name,
        COUNT(*) AS value
    FROM applicant a
    JOIN person p ON a.person_id = p.id
    LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
    LEFT JOIN high_school_info hs ON a.high_school_info_id = hs.id
    LEFT JOIN program pr ON a.program_id = pr.id
    LEFT JOIN score s ON a.id = s.applicant_id
    WHERE (:gender IS NULL OR p.gender = :gender)
      AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
      AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
      AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
      AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
      AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
      AND (:districtCode IS NULL OR u.district_code = :districtCode)
      AND (:schoolType IS NULL OR hs.type = :schoolType)
      AND (:status IS NULL OR a.status = :status)
      AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
      AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
      AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
      AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
      AND (:programId IS NULL OR a.program_id = :programId)
      AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
      AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
      AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
      AND a.available = 1
    GROUP BY
        CASE
            WHEN a.status = '01' THEN 'Pendiente'
            WHEN a.status = '02' THEN 'Aprobado'
            WHEN a.status = '03' THEN 'Rechazado'
            WHEN a.status = '04' THEN 'En revisión'
            WHEN a.status = '05' THEN 'Incompleta'
            ELSE 'Desconocido'
        END
    ORDER BY value DESC
""")
    List<ChartProjection> getChartByStatus(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );

    @Query(nativeQuery = true, value = """
    SELECT
        pr.name AS name,
        COUNT(*) AS value
    FROM applicant a
    JOIN person p ON a.person_id = p.id
    LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
    LEFT JOIN high_school_info hs ON a.high_school_info_id = hs.id
    LEFT JOIN program pr ON a.program_id = pr.id
    LEFT JOIN score s ON a.id = s.applicant_id
    WHERE (:gender IS NULL OR p.gender = :gender)
      AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
      AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
      AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
      AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
      AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
      AND (:districtCode IS NULL OR u.district_code = :districtCode)
      AND (:schoolType IS NULL OR hs.type = :schoolType)
      AND (:status IS NULL OR a.status = :status)
      AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
      AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
      AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
      AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
      AND (:programId IS NULL OR a.program_id = :programId)
      AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
      AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
      AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
      AND a.available = 1
    GROUP BY pr.name
    ORDER BY value DESC
""")
    List<ChartProjection> getChartByProgram(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );

    @Query(nativeQuery = true, value = """
    SELECT
        a.academic_period_name AS name,
        COUNT(*) AS value
    FROM applicant a
    JOIN person p ON a.person_id = p.id
    LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
    LEFT JOIN high_school_info hs ON a.high_school_info_id = hs.id
    LEFT JOIN program pr ON a.program_id = pr.id
    LEFT JOIN score s ON a.id = s.applicant_id
    WHERE (:gender IS NULL OR p.gender = :gender)
      AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
      AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
      AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
      AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
      AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
      AND (:districtCode IS NULL OR u.district_code = :districtCode)
      AND (:schoolType IS NULL OR hs.type = :schoolType)
      AND (:status IS NULL OR a.status = :status)
      AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
      AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
      AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
      AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
      AND (:programId IS NULL OR a.program_id = :programId)
      AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
      AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
      AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
      AND a.available = 1
    GROUP BY a.academic_period_name
    ORDER BY value DESC
""")
    List<ChartProjection> getChartByAcademicPeriod(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );
    @Query(nativeQuery = true, value = """
        SELECT 
            CASE 
                WHEN hs.type = '01' THEN 'Privado'
                WHEN hs.type = '02' THEN 'Estatal'
                WHEN hs.type = '03' THEN 'Parroquial'
                ELSE 'No especificado'
            END AS name, 
            COUNT(*) AS value
        FROM applicant a
        JOIN person p ON a.person_id = p.id
        JOIN high_school_info hs ON a.high_school_info_id = hs.id
        LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
        LEFT JOIN program pr ON a.program_id = pr.id
        LEFT JOIN score s ON a.id = s.applicant_id
        WHERE (:gender IS NULL OR p.gender = :gender)
          AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
          AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
          AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
          AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
          AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
          AND (:districtCode IS NULL OR u.district_code = :districtCode)
          AND (:schoolType IS NULL OR hs.type = :schoolType)
          AND (:status IS NULL OR a.status = :status)
          AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
          AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
          AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
          AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
          AND (:programId IS NULL OR a.program_id = :programId)
          AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
          AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
          AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
          AND a.available = 1
        GROUP BY 
            CASE 
                WHEN hs.type = '01' THEN 'Privado'
                WHEN hs.type = '02' THEN 'Estatal'
                WHEN hs.type = '03' THEN 'Parroquial'
                ELSE 'No especificado'
            END
        ORDER BY value DESC
    """)
    List<ChartProjection> getChartBySchoolType(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );


    @Query(nativeQuery = true, value = """
        SELECT 
            CASE 
                WHEN a.awareness_method = '01' THEN 'Redes Sociales'
                WHEN a.awareness_method = '02' THEN 'Amigos o Familia'
                WHEN a.awareness_method = '03' THEN 'Publicidad'
                WHEN a.awareness_method = '04' THEN 'Visita Escolar'
                WHEN a.awareness_method = '05' THEN 'Otro'
                ELSE 'No especificado'
            END AS name, 
            COUNT(*) AS value
        FROM applicant a
        JOIN person p ON a.person_id = p.id
        LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
        LEFT JOIN high_school_info hs ON a.high_school_info_id = hs.id
        LEFT JOIN program pr ON a.program_id = pr.id
        LEFT JOIN score s ON a.id = s.applicant_id
        WHERE (:gender IS NULL OR p.gender = :gender)
          AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
          AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
          AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
          AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
          AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
          AND (:districtCode IS NULL OR u.district_code = :districtCode)
          AND (:schoolType IS NULL OR hs.type = :schoolType)
          AND (:status IS NULL OR a.status = :status)
          AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
          AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
          AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
          AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
          AND (:programId IS NULL OR a.program_id = :programId)
          AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
          AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
          AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
          AND a.available = 1
        GROUP BY 
            CASE 
                WHEN a.awareness_method = '01' THEN 'Redes Sociales'
                WHEN a.awareness_method = '02' THEN 'Amigos o Familia'
                WHEN a.awareness_method = '03' THEN 'Publicidad'
                WHEN a.awareness_method = '04' THEN 'Visita Escolar'
                WHEN a.awareness_method = '05' THEN 'Otro'
                ELSE 'No especificado'
            END
        ORDER BY value DESC
    """)
    List<ChartProjection> getChartByContactMethod(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );

    @Query(nativeQuery = true, value = """
        SELECT 
            CASE 
                WHEN p.disability_type IS NULL THEN 'No tiene discapacidad'
                ELSE CASE
                    WHEN p.disability_type = '1' THEN 'Discapacidad Motriz'
                    WHEN p.disability_type = '2' THEN 'Discapacidad Visual'
                    -- Add other disability types here
                    ELSE 'Otra discapacidad'
                END 
            END AS name, 
            COUNT(*) AS value
        FROM applicant a
        JOIN person p ON a.person_id = p.id
        LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
        LEFT JOIN high_school_info hs ON a.high_school_info_id = hs.id
        LEFT JOIN program pr ON a.program_id = pr.id
        LEFT JOIN score s ON a.id = s.applicant_id
        WHERE (:gender IS NULL OR p.gender = :gender)
          AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
          AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
          AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
          AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
          AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
          AND (:districtCode IS NULL OR u.district_code = :districtCode)
          AND (:schoolType IS NULL OR hs.type = :schoolType)
          AND (:status IS NULL OR a.status = :status)
          AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
          AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
          AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
          AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
          AND (:programId IS NULL OR a.program_id = :programId)
          AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
          AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
          AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
          AND a.available = 1
        GROUP BY 
            CASE 
                 WHEN p.disability_type IS NULL THEN 'No tiene discapacidad'
                        ELSE CASE
                            WHEN p.disability_type = '1' THEN 'Discapacidad Motriz'
                            WHEN p.disability_type = '2' THEN 'Discapacidad Visual'
                            WHEN p.disability_type = '3' THEN 'Visual y Esquema Corporal'
                            WHEN p.disability_type = '4' THEN 'Disminuidos Visuales'
                            WHEN p.disability_type = '5' THEN 'Discapacidad Auditiva'
                            WHEN p.disability_type = '6' THEN 'Autismo'
                            WHEN p.disability_type = '7' THEN 'Discapacidad Mental'
                            WHEN p.disability_type = '8' THEN 'Parálisis Cerebral'
                            WHEN p.disability_type = '9' THEN 'Discapacidad Intelectual'
                            WHEN p.disability_type = '10' THEN 'Sordoceguera'
                            WHEN p.disability_type = '11' THEN 'No Cuenta con Información'
                            WHEN p.disability_type = '12' THEN 'Otros'
                            WHEN p.disability_type = '13' THEN 'Sindrome de Asperger'
                            WHEN p.disability_type = '14' THEN 'Hemiplejia no Identificada'
                            WHEN p.disability_type = '15' THEN 'Estenosis Congénita de la Válvula Aortica'
                            WHEN p.disability_type = '16' THEN 'Multidiscapacidad'
                            WHEN p.disability_type = '17' THEN 'Discapacidad Fisica'
                            WHEN p.disability_type = '18' THEN 'Transtorno del Espectro Autista'
                            WHEN p.disability_type = '19' THEN 'T. por Déficit de Atención con Hiperactividad'
                            WHEN p.disability_type = '20' THEN 'T. Especifico del Aprendizaje'
                            WHEN p.disability_type = '21' THEN 'T. Mentales y del Comportamiento'
                            WHEN p.disability_type = '22' THEN 'Enfermedades Raras'
                            WHEN p.disability_type = '23' THEN 'Talla Baja'
                            WHEN p.disability_type = '24' THEN 'Talento'
                            WHEN p.disability_type = '25' THEN 'Superdotación'
                            ELSE 'Otra discapacidad'
                        END
            END
        ORDER BY value DESC
    """)
    List<ChartProjection> getChartByDisabilityType(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );


    @Query(nativeQuery = true, value = """
    SELECT
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate))::int AS name,
        COUNT(*) AS value
    FROM applicant a
    JOIN person p ON a.person_id = p.id
    LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
    LEFT JOIN high_school_info hs ON a.high_school_info_id = hs.id
    LEFT JOIN program pr ON a.program_id = pr.id
    LEFT JOIN score s ON a.id = s.applicant_id
    WHERE (:gender IS NULL OR p.gender = :gender)
      AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
      AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
      AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
      AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
      AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
      AND (:districtCode IS NULL OR u.district_code = :districtCode)
      AND (:schoolType IS NULL OR hs.type = :schoolType)
      AND (:status IS NULL OR a.status = :status)
      AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
      AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
      AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
      AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
      AND (:programId IS NULL OR a.program_id = :programId)
      AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
      AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
      AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
      AND a.available = 1
    GROUP BY EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate))
    ORDER BY name
""")
    List<ChartProjection> getChartByAge(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );

    @Query(nativeQuery = true, value = """
        SELECT
            CAST(s.total_score AS VARCHAR) AS name,
            COUNT(*) AS value
        FROM applicant a
        LEFT JOIN score s ON s.applicant_id = a.id
        JOIN person p ON a.person_id = p.id
        LEFT JOIN ubigeo u ON p.ubigeo_id = u.id
        LEFT JOIN high_school_info hs ON a.high_school_info_id = hs.id
        LEFT JOIN program pr ON a.program_id = pr.id
        WHERE (:gender IS NULL OR p.gender = :gender)
          AND (:ageFrom IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) >= :ageFrom)
          AND (:ageTo IS NULL OR EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthdate)) <= :ageTo)
          AND (:applicantType IS NULL OR p.enrollment_mode = :applicantType)
          AND (:departmentCode IS NULL OR u.department_code = :departmentCode)
          AND (:provinceCode IS NULL OR u.province_code = :provinceCode)
          AND (:districtCode IS NULL OR u.district_code = :districtCode)
          AND (:schoolType IS NULL OR hs.type = :schoolType)
          AND (:status IS NULL OR a.status = :status)
          AND (:dateFrom IS NULL OR a.registry_date >= :dateFrom)
          AND (:dateTo IS NULL OR a.registry_date <= :dateTo)
          AND (:scoreFrom IS NULL OR s.total_score >= :scoreFrom)
          AND (:scoreTo IS NULL OR s.total_score <= :scoreTo)
          AND (:programId IS NULL OR a.program_id = :programId)
          AND (:contactMethod IS NULL OR a.awareness_method = :contactMethod)
          AND (:disabilityType IS NULL OR p.disability_type = CAST(:disabilityType AS VARCHAR))
          AND (:academicPeriod IS NULL OR a.academic_period_name = :academicPeriod)
          AND a.available = 1
        GROUP BY s.total_score
        ORDER BY s.total_score DESC
    """)
    List<ChartProjection> getChartByScore(
            @Param("gender") String gender,
            @Param("ageFrom") Integer ageFrom,
            @Param("ageTo") Integer ageTo,
            @Param("applicantType") String applicantType,
            @Param("departmentCode") String departmentCode,
            @Param("provinceCode") String provinceCode,
            @Param("districtCode") String districtCode,
            @Param("schoolType") String schoolType,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("scoreFrom") Double scoreFrom,
            @Param("scoreTo") Double scoreTo,
            @Param("programId") Long programId,
            @Param("contactMethod") String contactMethod,
            @Param("disabilityType") String disabilityType,
            @Param("academicPeriod") String academicPeriod
    );
}