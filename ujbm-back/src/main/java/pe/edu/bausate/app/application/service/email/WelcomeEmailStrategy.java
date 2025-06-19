package pe.edu.bausate.app.application.service.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class WelcomeEmailStrategy implements EmailStrategy {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Override
    public boolean supports(String type) {
        return "student-welcome".equals(type);
    }

    @Override // TODO: Pendiente de implementacion
    public void sendEmail(String to, Map<String, Object> variables) throws MessagingException {
        throw new UnsupportedOperationException("No se puede enviar un correo sin adjunto");
    }

    @Override
    public void sendEmailWithAttachment(String to, Map<String, Object> variables,
                                        String attachmentName, byte[] attachmentBytes,
                                        String mimeType) throws MessagingException {
        Context context = new Context();
        context.setVariables(variables);
        String body = templateEngine.process("emails/student-welcome.html", context);

        MimeMessage message = mailSender.createMimeMessage();
        // true en el segundo parámetro indica que es un mensaje multipart (para adjuntos)
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject("Matrícula exitosa - Bausate");
        helper.setText(body, true);

        // Adjuntar el archivo al correo
        helper.addAttachment(attachmentName, new ByteArrayResource(attachmentBytes), mimeType);

        mailSender.send(message);
    }
}
