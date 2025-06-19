package pe.edu.bausate.app.application.dto.sunat;

public record SunatSuccessResponse(
        String razonSocial,
        String tipoDocumento,
        String numeroDocumento,
        String estado,
        String condicion,
        String direccion,
        String ubigeo,
        String viaTipo,
        String viaNombre,
        String zonaCodigo,
        String zonaTipo,
        String numero,
        String interior,
        String lote,
        String dpto,
        String manzana,
        String kilometro,
        String distrito,
        String provincia,
        String departamento,
        boolean EsAgenteRetencion,
        boolean EsBuenContribuyente,
        Object localesAnexos
) implements SunatResponse {}
