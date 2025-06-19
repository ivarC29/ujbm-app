package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FacultyType implements DisplayableEnum {
    FACULTY("01", "Facultad", "Unidad académica de pregrado", true),
    GRADUATE_UNIT("02", "Unidad de Posgrado", "Unidad académica de posgrado", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}