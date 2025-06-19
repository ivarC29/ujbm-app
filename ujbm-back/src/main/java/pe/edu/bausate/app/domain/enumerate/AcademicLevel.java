package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AcademicLevel implements DisplayableEnum {
    PROFESSIONAL_CAREER("01", "Carrera Profesional", "Nivel académico de pregrado", true),
    MASTERS("02", "Maestría", "Nivel académico de posgrado - Maestría", true),
    DOCTORATE("03", "Doctorado", "Nivel académico de posgrado - Doctorado", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}
