package pe.edu.bausate.app.application.client;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GovernmentClientImpl implements GovernmentClient {

    private final RestTemplate restTemplate;

    private final String apisNetToken;

    @Override
    public String get(String endpoint) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apisNetToken);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(endpoint, HttpMethod.GET, entity, String.class);
        return response.getBody();
    }

    @Override
    public String post(String endpoint, Object request) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apisNetToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Object> entity = new HttpEntity<>(request, headers);
        ResponseEntity<String> response = restTemplate.exchange(endpoint, HttpMethod.POST, entity, String.class);
        return response.getBody();
    }

}
