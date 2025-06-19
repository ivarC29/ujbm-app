package pe.edu.bausate.app.application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.edu.bausate.app.application.dto.applicant.ApplicantFileRequest;
import pe.edu.bausate.app.application.dto.applicant.ApplicantFileResponse;
import pe.edu.bausate.app.domain.models.ApplicantFile;

@Mapper(componentModel = "spring")
public interface FileMapper {

    @Mapping(target = "id", ignore = true)
    ApplicantFile fileRequestToFile(ApplicantFileRequest applicantFileRequest);

    ApplicantFileResponse fileToFileResponse(ApplicantFile file);
}