package pe.edu.bausate.app.application.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.bausate.app.application.dto.config.SystemParameterDto;
import pe.edu.bausate.app.application.dto.config.SystemParameterResponse;
import pe.edu.bausate.app.domain.models.SystemParameter;
import pe.edu.bausate.app.domain.service.SystemParameterService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.PARAMETER_ADMIN)
@RequiredArgsConstructor
public class SystemParameterAdminController {
    private final SystemParameterService service;

    @PostMapping
    public ResponseEntity<SystemParameter> create(@RequestBody SystemParameterDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping
    public ResponseEntity<SystemParameter> update(@RequestBody SystemParameterDto dto) {
        return ResponseEntity.ok(service.update(dto));
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<Void> delete(@PathVariable String key) {
        service.delete(key);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{key}")
    public ResponseEntity<Object> get(@PathVariable String key) {
        return ResponseEntity.ok(service.get(key));
    }

    @GetMapping
    public ResponseEntity<List<SystemParameterResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PutMapping("/{key}/editable")
    public ResponseEntity<SystemParameter> setEditable(@PathVariable String key, @RequestParam Boolean editable) {
        return ResponseEntity.ok(service.setEditable(key, editable));
    }

}
