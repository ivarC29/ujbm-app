package pe.edu.bausate.app.infraestructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiConfig {
    @Value("${apisnet.token}")
    private String apisNetToken;

    @Value("${apisnet.reniec-base-url}")
    private String reniecBaseUrl;

    @Value("${apisnet.sunat-base-url}")
    private String sunatBaseUrl;

    @Bean
    public String apisNetToken() {
        return apisNetToken;
    }

    @Bean
    public String reniecBaseUrl() {
        return reniecBaseUrl;
    }

    @Bean
    public String sunatBaseUrl() { return sunatBaseUrl; }
}
