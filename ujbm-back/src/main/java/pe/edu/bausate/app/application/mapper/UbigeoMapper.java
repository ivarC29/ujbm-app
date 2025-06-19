package pe.edu.bausate.app.application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.edu.bausate.app.application.dto.UbigeoRequest;
import pe.edu.bausate.app.application.dto.UbigeoResponse;
import pe.edu.bausate.app.domain.models.Ubigeo;

@Mapper(componentModel = "spring")
public interface UbigeoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "departmentName", ignore = true)
    @Mapping(target = "provinceName", ignore = true)
    @Mapping(target = "districtName", ignore = true)
    @Mapping(target = "country", ignore = true)
    @Mapping(target = "reniecCode", ignore = true)
    @Mapping(target = "available", ignore = true)
    Ubigeo ubigeoRequestToUbigeo(UbigeoRequest ubigeoRequest);

    UbigeoResponse ubigeoToUbigeoResponse(Ubigeo ubigeo);
}
