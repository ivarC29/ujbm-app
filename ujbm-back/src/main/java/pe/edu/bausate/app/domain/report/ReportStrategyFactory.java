package pe.edu.bausate.app.domain.report;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReportStrategyFactory {
    private final PdfReportStrategy pdfReportStrategy;
    private final ExcelReportStrategy excelReportStrategy;

    public ReportStrategy getStrategy(ReportType type) {
        return switch (type) {
            case PDF -> pdfReportStrategy;
            case XLS -> excelReportStrategy;
            default -> throw new IllegalArgumentException("Unsupported report type: " + type);
        };
    }

    public enum ReportType {
        PDF, XLS
    }
}
