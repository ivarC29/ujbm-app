package pe.edu.bausate.app.application.mapper.external;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Named;
import pe.edu.bausate.app.application.dto.reniec.ReniecErrorResponse;
import pe.edu.bausate.app.application.dto.reniec.ReniecResponse;
import pe.edu.bausate.app.application.dto.reniec.ReniecSuccessResponse;
import pe.edu.bausate.app.application.dto.sunat.SunatErrorResponse;
import pe.edu.bausate.app.application.dto.sunat.SunatResponse;
import pe.edu.bausate.app.application.dto.sunat.SunatSuccessResponse;

@Mapper(componentModel = "spring")
public interface ReniecResponseMapper {
    @Named("jsonToReniecResponse")
    default ReniecResponse jsonToReniecResponse(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            if (json.contains("error")) {
                return mapper.readValue(json, ReniecErrorResponse.class);
            } else {
                return mapper.readValue(json, ReniecSuccessResponse.class);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear respuesta de RENIEC", e);
        }
    }

    @Named("jsonToSunatResponse")
    default SunatResponse jsonToSunatResponse(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            if (json.contains("error")) {
                return mapper.readValue(json, SunatErrorResponse.class);
            } else {
                return mapper.readValue(json, SunatSuccessResponse.class);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear respuesta de SUNAT", e);
        }
    }
}
