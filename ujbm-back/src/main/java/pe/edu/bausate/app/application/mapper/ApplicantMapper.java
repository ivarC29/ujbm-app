package pe.edu.bausate.app.application.mapper;

import org.mapstruct.*;
import pe.edu.bausate.app.application.dto.applicant.ApplicantRequest;
import pe.edu.bausate.app.application.dto.applicant.ApplicantResponse;
import pe.edu.bausate.app.application.dto.applicant.ApplicantScoreResponse;
import pe.edu.bausate.app.application.dto.applicant.ApplicantTableInfoResponse;
import pe.edu.bausate.app.domain.enumerate.AwarenessMethod;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;
import pe.edu.bausate.app.domain.enumerate.EnrollmentMode;
import pe.edu.bausate.app.domain.models.*;
import pe.edu.bausate.app.domain.enumerate.ApplicantStatus;
import pe.edu.bausate.app.domain.models.projection.ApplicantScoreProjection;

import java.time.LocalDate;
import java.util.List;

@Mapper(componentModel = "spring", uses = {PersonMapper.class, ProgramMapper.class, HighSchoolInfoMapper.class, FileMapper.class})
public interface ApplicantMapper {

    @Mapping(target = "status", source = "status", qualifiedByName = "mapStatusToString")
    @Mapping(target = "awarenessMethod", source = "awarenessMethod", qualifiedByName = "mapAwarenessMethodToString")
    @Mapping(target = "programId", source = "program", qualifiedByName = "mapProgramToId")
    @Mapping(target = "highSchoolInfoId", source = "highSchoolInfo", qualifiedByName = "mapHighSchoolInfoToId")
    @Mapping(target = "personId", source = "person", qualifiedByName = "mapPersonToId")
    @Mapping(target = "dniFileId", source = "dniFile", qualifiedByName = "mapFileToId")
    @Mapping(target = "studyCertificateFileId", source = "studyCertificateFile", qualifiedByName = "mapFileToId")
    @Mapping(target = "photoFileId", source = "photoFile", qualifiedByName = "mapFileToId")
    @Mapping(target = "syllabusFileIds", source = "syllabusFiles", qualifiedByName = "mapFilesToId")
    ApplicantResponse applicantToApplicantResponse(Applicant applicant);

    @Mapping(target = "program", ignore = true)
    @Mapping(target = "status", source = "status", qualifiedByName = "mapStringToStatus")
    @Mapping(target = "awarenessMethod", source = "awarenessMethod", qualifiedByName = "mapStringToAwarenessMethod")
    @Mapping(target = "registryDate", source = "registryDate", qualifiedByName = "mapDefaultDate")
    @Mapping(target = "available", expression = "java(true)")
    Applicant applicantRequestToApplicant(ApplicantRequest applicantRequest);

    @Mapping(target = "answers", source = "projection.answers", qualifiedByName = "mapAnswersToList")
    ApplicantScoreResponse applicantScoreProjectionToResponse(ApplicantScoreProjection projection, String academicPeriodName, boolean isApproved);

    @Mapping(target = "fullName", source = "person", qualifiedByName = "mapFullName")
    @Mapping(target = "enrollmentModeCode", source = "person.enrollmentMode", qualifiedByName = "mapEnrollmentModeToCode")
    @Mapping(target = "enrollmentModeName", source = "person.enrollmentMode", qualifiedByName = "mapEnrollmentModeToName")
    @Mapping(target = "documentNumber", source = "person.documentNumber")
    @Mapping(target = "statusCode", source = "status", qualifiedByName = "mapStatusToCode")
    @Mapping(target = "statusName", source = "status", qualifiedByName = "mapStatusToName")
    @Mapping(target = "enrolled", source = "isEnrolled")
    @Mapping(target = "programId", source = "program.id")
    @Mapping(target = "programName", source = "program.name")
    @Mapping(target = "dniFileId", source = "dniFile.id")
    @Mapping(target = "studyCertificateFileId", source = "studyCertificateFile.id")
    @Mapping(target = "photoFileId", source = "photoFile.id")
    @Mapping(target = "paymentReceiptFile1Id", source = "paymentReceiptFile1.id")
    @Mapping(target = "paymentReceiptFile2Id", source = "paymentReceiptFile2.id")
    @Mapping(target = "scoreId", source = "score.id")
    @Mapping(target = "totalScore", source = "score.totalScore")
    @Mapping(target = "isApproved", source = "applicant", qualifiedByName = "calculateIsApproved")
    ApplicantTableInfoResponse applicantToApplicantTableInfoResponse(Applicant applicant);

    @Named("calculateIsApproved")
    default Boolean calculateIsApproved(Applicant applicant) {
        if (applicant == null || applicant.getScore() == null || applicant.getPerson() == null || applicant.getPerson().getEnrollmentMode() == null) {
            return false;
        }
        Integer totalScore = applicant.getScore().getTotalScore();
        Integer minimumScore = applicant.getPerson().getEnrollmentMode().getMinimumScore();
        return totalScore != null && minimumScore != null && totalScore >= minimumScore;
    }

    @Named("mapFullName")
    default String mapFullName(Person person) {
        return person != null ? person.getName() + " " + person.getLastname() : null;
    }

    @Named("mapEnrollmentModeToCode")
    default String mapEnrollmentModeToCode(EnrollmentMode mode) {
        return mode != null ? mode.getCode() : null;
    }

    @Named("mapEnrollmentModeToName")
    default String mapEnrollmentModeToName(EnrollmentMode mode) {
        return mode != null ? mode.getDisplayName() : null;
    }

    @Named("mapStatusToCode")
    default String mapStatusToCode(ApplicantStatus status) {
        return status != null ? status.getCode() : null;
    }

    @Named("mapStatusToName")
    default String mapStatusToName(ApplicantStatus status) {
        return status != null ? status.getDisplayName() : null;
    }

    @Named("mapStringToStatus")
    default ApplicantStatus mapStringToStatus(String code) {
        if (code == null || code.isBlank()) return ApplicantStatus.PENDING;
        return DisplayableEnum.fromCode(ApplicantStatus.class, code);
    }

    @Named("mapStatusToString")
    default String mapStatusToString(ApplicantStatus status) {
        return status != null ? status.getCode() : null;
    }

    @Named("mapStringToAwarenessMethod")
    default AwarenessMethod mapStringToAwarenessMethod(String code) {
        if (code == null || code.isBlank()) return null;
        return DisplayableEnum.fromCode(AwarenessMethod.class, code);
    }

    @Named("mapAwarenessMethodToString")
    default String mapAwarenessMethodToString(AwarenessMethod awarenessMethod) {
        return awarenessMethod != null ? awarenessMethod.getCode() : null;
    }

    @Named("mapDefaultDate")
    default LocalDate mapDefaultDate(LocalDate date) {
        return date != null ? date : LocalDate.now();
    }

    @Named("mapProgramToId")
    default Long mapProgramToId(Program program) {
        return program.getId();
    }

    @Named("mapPersonToId")
    default Long mapPersonToId(Person person) {
        return person.getId();
    }

    @Named("mapHighSchoolInfoToId")
    default Long mapHighSchoolInfoToId(HighSchoolInfo HighSchoolInfo) {
        return HighSchoolInfo.getId();
    }

    @Named("mapFileToId")
    default Long mapFileToId(ApplicantFile file) {
        return file.getId();
    }

    @Named("mapFilesToId")
    default List<Long> mapFilesToId(List<ApplicantFile> files) {
        if (files == null) return null;
        return files.stream()
                .map(ApplicantFile::getId)
                .toList();
    }

    @Named("mapAnswersToList")
    default List<String> mapAnswersToList(String answers) {
        return answers != null ? List.of(answers.split(";")) : List.of();
    }

}
