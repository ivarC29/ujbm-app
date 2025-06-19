package pe.edu.bausate.app.domain.enumerate;


import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EnrollmentStatus implements DisplayableEnum{
    DRAFT("00", "Borrador", "Matrícula en proceso de creación", true),
    PENDING("01", "Pendiente", "Matrícula aún no confirmada", true),
    CONFIRMED("02", "Confirmado", "Matrícula confirmada exitosamente", true),
    CANCELLED("03", "Cancelado", "Matrícula anulada por el estudiante o el sistema", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}
