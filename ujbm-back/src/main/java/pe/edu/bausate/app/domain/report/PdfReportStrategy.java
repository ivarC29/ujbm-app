package pe.edu.bausate.app.domain.report;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PdfReportStrategy implements ReportStrategy {
    private final TemplateEngine templateEngine;

    @Override
    public byte[] generateReport(String templateName, Map<String, Object> data) {
        try {
            // Procesar la plantilla Thymeleaf
            Context context = new Context(Locale.getDefault());
            context.setVariables(data);
            String htmlContent = templateEngine.process(templateName, context);

            // Convertir HTML a PDF usando Flying Saucer
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);

            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF report", e);
        }
    }

    @Override
    public String getContentType() {
        return "application/pdf";
    }

    @Override
    public String getFileExtension() {
        return "pdf";
    }
}
