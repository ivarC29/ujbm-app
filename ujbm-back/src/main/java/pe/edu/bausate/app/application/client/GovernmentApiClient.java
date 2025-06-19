package pe.edu.bausate.app.application.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import pe.edu.bausate.app.application.dto.reniec.ReniecResponse;
import pe.edu.bausate.app.application.dto.sunat.SunatResponse;
import pe.edu.bausate.app.application.mapper.external.ReniecResponseMapper;
import pe.edu.bausate.app.infraestructure.exception.ReniecClientException;
import static pe.edu.bausate.app.infraestructure.util.helper.GovernmentDataUtils.extractMessage;

@Service
@RequiredArgsConstructor
public class GovernmentApiClient {

    private final GovernmentClient governmentClient;
    private final ReniecResponseMapper mapper;
    private final String reniecBaseUrl;
    private final String sunatBaseUrl;

    public ReniecResponse getCitizenInfoByDni(String dni) {
        String endpoint = reniecBaseUrl + "?numero=" + dni;
        try {
            String json = governmentClient.get(endpoint);
            return mapper.jsonToReniecResponse(json);
        } catch (HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            String message = extractMessage(errorBody);
            throw new ReniecClientException(e.getStatusCode().value(), message);
        }
    }

    public SunatResponse getCitizenInfoByRuc(String ruc) {
        String endpoint = sunatBaseUrl + "?numero=" + ruc;
        try {
            String json = governmentClient.get(endpoint);
            return mapper.jsonToSunatResponse(json);
        } catch (HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            String message = extractMessage(errorBody);
            throw new ReniecClientException(e.getStatusCode().value(), message);
        }
    }

}
