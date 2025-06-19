package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.bausate.app.application.dto.AcademicPeriodSelectResponse;
import pe.edu.bausate.app.domain.service.AcademicPeriodService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.ACADEMIC_PERIOD_ADMIN)
@RequiredArgsConstructor
@Tag(name = "Applicants", description = "Operaciones de administracion relacionadas con los periodos academicos")
public class AcademicPeriodAdminController {
    private final AcademicPeriodService academicPeriodService;

    @GetMapping("/select")
    @Operation(
            summary = "Listar periodos académicos para select",
            description = "Retorna una lista de periodos académicos disponibles (solo id y name) para ser usados en un select."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public List<AcademicPeriodSelectResponse> getAllForSelect() {
        return academicPeriodService.getAllForSelect();
    }
}
