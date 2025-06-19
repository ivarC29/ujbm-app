package pe.edu.bausate.app.application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import pe.edu.bausate.app.application.dto.HighSchoolInfoRequest;
import pe.edu.bausate.app.application.dto.HighSchoolInfoResponse;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;
import pe.edu.bausate.app.domain.enumerate.HighSchoolType;
import pe.edu.bausate.app.domain.models.HighSchoolInfo;

@Mapper(componentModel = "spring", uses = {UbigeoMapper.class})
public interface HighSchoolInfoMapper {
    @Mapping(target = "type", source = "type", qualifiedByName = "mapStringToHighSchoolType")
    HighSchoolInfo highSchoolInfoRequestToHighSchoolInfo(HighSchoolInfoRequest highSchoolInfoRequest);

    @Mapping(target = "type", source = "type", qualifiedByName = "mapHighSchoolTypeToString")
    HighSchoolInfoResponse highSchoolInfoToHighSchoolInfoResponse(HighSchoolInfo highSchoolInfo);

    @Named("mapStringToHighSchoolType")
    default HighSchoolType mapStringToHighSchoolType(String code) {
        if (code == null || code.isBlank()) return null;
        return DisplayableEnum.fromCode(HighSchoolType.class, code);
    }

    @Named("mapHighSchoolTypeToString")
    default String mapHighSchoolTypeToString(HighSchoolType type) {
        return type != null ? type.getCode() : null;
    }
}
