package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum GradeStatus implements DisplayableEnum {
    NOT_GRADED("01", "No calificado", "El examen no ha sido calificado", true),
    PARTIALLY_GRADED("02", "Parcialmente calificado", "Algunas preguntas han sido calificadas", true),
    GRADED("03", "Calificado", "El examen ha sido calificado completamente", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}
