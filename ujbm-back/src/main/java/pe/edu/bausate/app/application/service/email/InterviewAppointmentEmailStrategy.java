package pe.edu.bausate.app.application.service.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class InterviewAppointmentEmailStrategy implements EmailStrategy {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Override
    public boolean supports(String type) {
        return "interview-appointment".equals(type);
    }

    @Override
    public void sendEmail(String to, Map<String, Object> variables) throws MessagingException {
        Context context = new Context();
        context.setVariables(variables);
        String body = templateEngine.process("emails/interview-appointment.html", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
        helper.setTo(to);
        helper.setSubject("Confirmación de Entrevista - Universidad Jaime Bausate y Meza");
        helper.setText(body, true);
        mailSender.send(message);
    }
}