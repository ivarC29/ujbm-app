package pe.edu.bausate.app.application.service.email;

import jakarta.mail.MessagingException;

import java.util.Map;

public interface EmailStrategy {
    boolean supports(String type);
    void sendEmail(String to, Map<String, Object> variables) throws MessagingException;

    default void sendEmailWithAttachment(String to, Map<String, Object> variables,
                                         String attachmentName, byte[] attachmentBytes,
                                         String mimeType) throws MessagingException {
        throw new UnsupportedOperationException("Este tipo de correo no soporta adjuntos");
    }

}
