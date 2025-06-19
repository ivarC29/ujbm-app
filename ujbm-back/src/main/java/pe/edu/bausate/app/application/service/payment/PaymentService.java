package pe.edu.bausate.app.application.service.payment;

import org.springframework.stereotype.Service;
import pe.edu.bausate.app.domain.models.Applicant;

@Service
public class PaymentService {
    public String generatePayment(Applicant applicant) {
        // Integrar con Culqi u otra pasarela

        // LLamar a la API Culqi o retornar URL de pago
        String dni = applicant.getPerson().getDocumentNumber();
        Double amount = 150.00; // Monto fijo o variable

        // Por ahora devolvemos una URL ficticia
        return "https://culqi.com/pagar?dni=" + dni + "&amount=" + amount;
    }
}
