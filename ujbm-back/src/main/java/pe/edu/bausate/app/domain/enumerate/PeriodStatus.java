package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PeriodStatus implements DisplayableEnum{
    ACTIVE("01", "Activo", "El periodo académico está en curso", true),
    CLOSED("02", "Cerrado", "El periodo académico ha finalizado", true),
    PLANNED("03", "Planificado", "El periodo académico está programado para el futuro", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}
