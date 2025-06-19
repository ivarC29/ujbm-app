package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import pe.edu.bausate.app.application.client.GovernmentApiClient;
import pe.edu.bausate.app.application.dto.PersonResponse;
import pe.edu.bausate.app.application.dto.reniec.ReniecResponse;
import pe.edu.bausate.app.application.dto.reniec.ReniecSuccessResponse;
import pe.edu.bausate.app.application.dto.sunat.SunatResponse;
import pe.edu.bausate.app.application.dto.sunat.SunatSuccessResponse;
import pe.edu.bausate.app.application.mapper.PersonMapper;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

@RestController
@RequestMapping(ApiPaths.GOVERNMENT_PUBLIC)
@RequiredArgsConstructor
@Tag(name = "Entidades externas", description = "Consumo de API's RENIEC SUNAT, etc.")
public class GovernmentClientsPublicController {
    private final GovernmentApiClient governmentApiClient;
    private final PersonMapper personMapper;


    @GetMapping("/reniec/{dni}")
    public ResponseEntity<ReniecResponse > getCitizenInfo(@PathVariable String dni) {
        ReniecResponse response = governmentApiClient.getCitizenInfoByDni(dni);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reniec/form/{dni}")
    public ResponseEntity<?> getFormDataFromReniec(@PathVariable String dni) {
        ReniecResponse response = governmentApiClient.getCitizenInfoByDni(dni);

        if (response instanceof ReniecSuccessResponse success) {
            PersonResponse person = personMapper.fromReniecSuccess(success);
            return ResponseEntity.ok(person);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/sunat/{ruc}")
    public ResponseEntity<SunatResponse> getCitizenInfoByRuc(@PathVariable String ruc) {
        SunatResponse response = governmentApiClient.getCitizenInfoByRuc(ruc);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sunat/form/{ruc}")
    public ResponseEntity<?> getFormDataFromSunat(@PathVariable String ruc) {
        SunatResponse response = governmentApiClient.getCitizenInfoByRuc(ruc);

        if (response instanceof SunatSuccessResponse success) {
            PersonResponse person = personMapper.fromSunatSuccess(success);
            return ResponseEntity.ok(person);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}
