package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.bausate.app.application.dto.dashboard.ChartDataDTO;
import pe.edu.bausate.app.application.dto.dashboard.DashboardFilterRequest;
import pe.edu.bausate.app.domain.service.DashboardService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.DASHBOARD_ADMIN)
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Endpoints para analíticas y dashboard de postulantes")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Obtener datos para gráficos con filtros flexibles")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Datos de gráficos obtenidos correctamente"),
            @ApiResponse(responseCode = "400", description = "Parámetros inválidos"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PostMapping("/chart-data-applicant")
    public ResponseEntity<List<ChartDataDTO>> getChartDataApplicant(
            @RequestBody DashboardFilterRequest filter) {
        return ResponseEntity.ok(dashboardService.getChartData(filter));
    }
}