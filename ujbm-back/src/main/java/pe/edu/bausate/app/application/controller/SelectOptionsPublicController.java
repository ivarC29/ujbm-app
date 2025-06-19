package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import pe.edu.bausate.app.domain.enumerate.*;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;
import pe.edu.bausate.app.infraestructure.util.EnumMapper;
import pe.edu.bausate.app.application.dto.EnumOptionResponse;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping(ApiPaths.ENUMS_PUBLIC)
@RequiredArgsConstructor
@Tag(name = "Select Options", description = "Operaciones para obtención de datos escogibles")
public class SelectOptionsPublicController {
    private final EnumMapper enumMapper;
    private final EnumRegistry enumRegistry;

    @Operation(summary = "Obtener valores para una select", description = "Devuelve una lista de opciones para un enum dado")
    @GetMapping("/{enumName}")
    public ResponseEntity<List<EnumOptionResponse>> getEnumOptions(@PathVariable String enumName) {
        return enumRegistry.getEnumClass(enumName)
                .map(enumMapper::mapEnum)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Obtener valores disponibles para listar", description = "Devuelve una lista con enums disponibles en el sistema.")
    @GetMapping
    public ResponseEntity<Set<String>> getAvailableEnums() {
        return ResponseEntity.ok().body(enumRegistry.getAvailableEnums());
    }


}
