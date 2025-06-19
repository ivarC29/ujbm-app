package pe.edu.bausate.app.application.dto.reniec;

public record ReniecSuccessResponse(
        String nombres,
        String apellidoPaterno,
        String apellidoMaterno,
        String nombreCompleto,
        String tipoDocumento,
        String numeroDocumento,
        String digitoVerificador
) implements ReniecResponse {}
