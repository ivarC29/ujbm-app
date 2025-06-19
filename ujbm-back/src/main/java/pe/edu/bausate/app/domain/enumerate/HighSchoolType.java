package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum HighSchoolType implements DisplayableEnum {
    PRIVATE("01", "Privado", "Colegio de gestión privada", true),
    PUBLIC("02", "Estatal", "Colegio de gestión estatal", true),
    PAROCHIAL("03", "Parroquial", "Colegio de gestión parroquial", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}