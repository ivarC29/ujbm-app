package pe.edu.bausate.app.domain.report;

import java.util.Map;

public interface ReportStrategy {
    byte[] generateReport(String templateName, Map<String, Object> data);
    String getContentType();
    String getFileExtension();
}
