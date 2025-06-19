package pe.edu.bausate.app.application.service.email;

import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {
    private final List<EmailStrategy> strategies;

    public EmailService(List<EmailStrategy> strategies) {
        this.strategies = strategies;
    }

    @SneakyThrows
    public void send(String type, String to, Map<String, Object> variables) {
        strategies.stream()
                .filter(s -> s.supports(type))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Tipo de correo no soportado " + type))
                .sendEmail(to, variables);
    }

    @SneakyThrows
    public void sendWithAttachment(String type, String to, Map<String, Object> variables,
                                   String attachmentName, byte[] attachmentBytes,
                                   String mimeType) {
        strategies.stream()
                .filter(s -> s.supports(type))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Tipo de correo con adjunto no soportado " + type))
                .sendEmailWithAttachment(to, variables, attachmentName, attachmentBytes, mimeType);
    }

}
