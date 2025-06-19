package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StudyMode implements DisplayableEnum {
    UNDECLARED("0", "Dato no declarado", "El modo de estudio no ha sido declarado.", true),
    ONSITE("1", "Presencial", "Estudios realizados de manera presencial.", true),
    SEMI_ONSITE("2", "Semi-Presencial", "Estudios realizados de manera semi-presencial.", true),
    DISTANCE("3", "A distancia", "Estudios realizados completamente a distancia.", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}