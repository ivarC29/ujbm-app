package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ScheduleType implements DisplayableEnum {
    EXAM("01", "Examen", "Programación de un examen", true),
    INTERVIEW("02", "Entrevista", "Programación de una entrevista", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}