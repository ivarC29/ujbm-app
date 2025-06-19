package pe.edu.bausate.app.application.mapper;

import org.mapstruct.*;
import pe.edu.bausate.app.application.dto.PersonRequest;
import pe.edu.bausate.app.application.dto.PersonResponse;
import pe.edu.bausate.app.application.dto.reniec.ReniecSuccessResponse;
import pe.edu.bausate.app.application.dto.sunat.SunatSuccessResponse;
import pe.edu.bausate.app.domain.enumerate.*;
import pe.edu.bausate.app.domain.models.Person;
import static pe.edu.bausate.app.infraestructure.util.helper.GovernmentDataUtils.*;

@Mapper(componentModel = "spring", uses = {UbigeoMapper.class})
public interface PersonMapper {

    @Mapping(target = "documentIdType", source = "documentIdType", qualifiedByName = "mapDocIdTypeToString")
    @Mapping(target = "type", source = "type", qualifiedByName = "mapPersonTypeToString")
    @Mapping(target = "enrollmentMode", source = "enrollmentMode", qualifiedByName = "mapEnrollmentModeToString")
    @Mapping(target = "disabilityType", source = "disabilityType", qualifiedByName = "mapDisabilityTypeToString")
    @Mapping(target = "gender", source = "gender", qualifiedByName = "mapGenderToString")
    PersonResponse personToPersonResponse(Person person);

    @Mapping(target = "ubigeo", source = "ubigeo", ignore = true)
    @Mapping(target = "documentIdType", source = "documentIdType", qualifiedByName = "mapStringToDocIdType")
    @Mapping(target = "type", source = "type", qualifiedByName = "mapStringToPersonType")
    @Mapping(target = "enrollmentMode", source = "enrollmentMode", qualifiedByName = "mapStringToEnrollmentMode")
    @Mapping(target = "disabilityType", source = "disabilityType", qualifiedByName = "mapStringToDisabilityType")
    @Mapping(target = "gender", source = "gender", qualifiedByName = "mapStringToGender")
    Person personRequestToPerson(PersonRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "documentIdType", source = "documentIdType", qualifiedByName = "mapStringToDocIdType")
    @Mapping(target = "type", source = "type", qualifiedByName = "mapStringToPersonType")
    @Mapping(target = "enrollmentMode", source = "enrollmentMode", qualifiedByName = "mapStringToEnrollmentMode")
    @Mapping(target = "disabilityType", source = "disabilityType", qualifiedByName = "mapStringToDisabilityType")
    @Mapping(target = "gender", source = "gender", qualifiedByName = "mapStringToGender")
    void updatePersonFromDto(PersonRequest dto, @MappingTarget Person entity);

    @Named("mapStringToDocIdType")
    static DocumentIdType mapStringToDocIdType(String code) {
        if (code == null || code.isBlank()) return null;
        return DisplayableEnum.fromCode(DocumentIdType.class, code.trim());
    }

    @Named("mapStringToPersonType")
    static PersonType mapStringToPersonType(String code) {
        if (code == null || code.isBlank()) return null;
        return DisplayableEnum.fromCode(PersonType.class, code.trim());
    }

    @Named("mapStringToEnrollmentMode")
    static EnrollmentMode mapStringToEnrollmentMode(String code) {
        if (code == null || code.isBlank()) return null;
        return DisplayableEnum.fromCode(EnrollmentMode.class, code.trim());
    }

    @Named("mapDocIdTypeToString")
    static String mapDocIdTypeToString(DocumentIdType documentIdType) {
        return documentIdType != null ? documentIdType.getCode() : null;
    }

    @Named("mapPersonTypeToString")
    static String mapPersonTypeToString(PersonType personType) {
        return personType != null ? personType.getCode() : null;
    }

    @Named("mapEnrollmentModeToString")
    static String mapEnrollmentModeToString(EnrollmentMode enrollmentMode) {
        return enrollmentMode != null ? enrollmentMode.getCode() : null;
    }

    @Named("mapStringToDisabilityType")
    default DisabilityType mapStringToDisabilityType(String code) {
        if (code == null || code.isBlank()) return null;
        return DisplayableEnum.fromCode(DisabilityType.class, code);
    }

    @Named("mapDisabilityTypeToString")
    default String mapDisabilityTypeToString(DisabilityType disabilityType) {
        return disabilityType != null ? disabilityType.getCode() : null;
    }

    @Named("mapStringToGender")
    default Gender mapStringToGender(String code) {
        if (code == null || code.isBlank()) return null;
        return DisplayableEnum.fromCode(Gender.class, code);
    }

    @Named("mapGenderToString")
    default String mapGenderToString(Gender gender) {
        return gender != null ? gender.getCode() : null;
    }

    @Named("fromReniecSuccess")
    default PersonResponse fromReniecSuccess(ReniecSuccessResponse reniec) {
        return new PersonResponse(
                capitalize(reniec.nombres()),
                capitalize(reniec.apellidoPaterno() + " " + reniec.apellidoMaterno()),
                formatDocType(reniec.tipoDocumento()),
                reniec.numeroDocumento(),
                null // address
        );
    }

    @Named("fromSunatSuccess")
    default PersonResponse fromSunatSuccess(SunatSuccessResponse sunat) {
        SeparatedName datos = splitFullName(sunat.razonSocial());
        return new PersonResponse(
                capitalize(datos.givenNames()),
                capitalize(datos.surnames()),
                formatDocType(sunat.tipoDocumento()),
                sunat.numeroDocumento(),
                sunat.direccion()
        );
    }
}
