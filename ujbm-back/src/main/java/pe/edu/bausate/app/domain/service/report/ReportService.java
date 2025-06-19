package pe.edu.bausate.app.domain.service.report;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.bausate.app.domain.report.ReportStrategy;
import pe.edu.bausate.app.domain.report.ReportStrategyFactory;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportStrategyFactory strategyFactory;

    public byte[] generateReport(ReportStrategyFactory.ReportType type, String templateName, Map<String, Object> data) {
        ReportStrategy strategy = strategyFactory.getStrategy(type);
        return strategy.generateReport(templateName, data);
    }

    public String getContentType(ReportStrategyFactory.ReportType type) {
        ReportStrategy strategy = strategyFactory.getStrategy(type);
        return strategy.getContentType();
    }

    public String getFileExtension(ReportStrategyFactory.ReportType type) {
        ReportStrategy strategy = strategyFactory.getStrategy(type);
        return strategy.getFileExtension();
    }
}
