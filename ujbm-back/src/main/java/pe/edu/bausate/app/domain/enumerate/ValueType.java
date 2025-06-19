package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ValueType implements DisplayableEnum {
    STRING("0", "Texto", "", true),
    INTEGER("1", "Entero", "", true),
    DECIMAL("2", "Decimal", "", true),
    BOOLEAN("3", "Booleano", "", true),
    DATE("4", "Fecha", "", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}
