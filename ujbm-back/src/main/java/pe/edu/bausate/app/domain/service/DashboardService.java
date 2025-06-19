package pe.edu.bausate.app.domain.service;

import pe.edu.bausate.app.application.dto.dashboard.ChartDataDTO;
import pe.edu.bausate.app.application.dto.dashboard.DashboardFilterRequest;

import java.util.List;

public interface DashboardService {
    List<ChartDataDTO> getChartData(DashboardFilterRequest filter);
}