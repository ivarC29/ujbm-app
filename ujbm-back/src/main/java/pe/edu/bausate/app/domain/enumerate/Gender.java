package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Gender implements DisplayableEnum {
    MALE("1", "Masculino", "Sexo masculino.", true),
    FEMALE("2", "Femenino", "Sexo femenino.", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}