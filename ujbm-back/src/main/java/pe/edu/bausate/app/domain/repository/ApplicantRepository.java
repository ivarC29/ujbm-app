package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.bausate.app.domain.models.Applicant;
import pe.edu.bausate.app.domain.models.projection.ApplicantResumeProjection;
import pe.edu.bausate.app.domain.models.projection.ApplicantScoreProjection;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ApplicantRepository extends
        JpaRepository<Applicant, Long>,
        JpaSpecificationExecutor<Applicant> {

    boolean existsByPersonDocumentNumber(String documentNumber);

    @Modifying
    @Query("UPDATE Applicant a SET a.available = false WHERE a.id = :id")
    void disableApplicant(@Param("id") Long id);

    boolean existsByCode(String code);

    boolean existsApplicantByPersonDocumentNumberAndAvailableTrue(String documentNumber);
    List<Applicant> findAllByAvailableTrueAndAcademicPeriodName(String academicPeriodName);

    Optional<Applicant> findByPersonDocumentNumber(String documentNumber);

    @Query("""
        SELECT a.id AS id,
               a.code AS code,
               CONCAT(a.person.name, ' ', a.person.lastname) AS fullName,
               a.person.documentNumber AS documentNumber,
               a.program.name AS programName,
               a.person.enrollmentMode AS enrollmentMode,
               a.registryDate AS registryDate,
               a.academicPeriodName AS academicPeriod
        FROM Applicant a
        WHERE a.person.documentNumber = :dni
            AND a.available = true
            AND (
                (:paymentType = 'PAYMENT1' AND a.paymentReceiptFile1 IS NULL AND a.hasPaidAdmissionFee = false)
                OR
                (:paymentType = 'PAYMENT2' AND a.paymentReceiptFile2 IS NULL AND a.isEnrolled = false AND a.hasPaidAdmissionFee = true)
            )
    """)
    Optional<ApplicantResumeProjection> findApplicantProjectionByDni(@Param("dni") String dni, @Param("paymentType") String paymentType);

    Optional<Applicant> findByCode(String code);
    List<Applicant> findAllByCodeIn(Collection<String> codes);

    @Query("""
        SELECT a.code AS code,
               CONCAT(p.name, ' ', p.lastname) AS fullName,
               a.registryDate AS registryDate,
               pr.name AS programName,
               s.totalScore AS totalScore,
               s.answers AS answers,
               p.enrollmentMode AS enrollmentMode
        FROM Applicant a
        JOIN a.person p
        JOIN a.program pr
        LEFT JOIN a.score s
        WHERE a.id = :applicantId
    """)
    Optional<ApplicantScoreProjection> findApplicantScoreDetails(@Param("applicantId") Long applicantId);

    @Modifying
    @Query("UPDATE Score s SET s.totalScore = :score, s.answers = :answers WHERE s.applicant.id = :applicantId")
    void updateScoreByApplicantId(@Param("applicantId") Long applicantId,
                                  @Param("score") Integer score,
                                  @Param("answers") String answers);


    //Interview
    @Query("SELECT a FROM Applicant a " +
           "LEFT JOIN a.score s " +
           "JOIN a.program p " +
           "WHERE a.hasPaidAdmissionFee = true " +
           "AND (s IS NULL OR s.totalScore IS NULL) " +
           "AND a.available = true " +
           "AND a.status <> pe.edu.bausate.app.domain.enumerate.ApplicantStatus.REJECTED " +
           "AND LOWER(p.name) = LOWER('Periodismo')")
    List<Applicant> findPendingJournalismInterviews();

}
