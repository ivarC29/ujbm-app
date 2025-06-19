package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PersonType implements DisplayableEnum{
    APPLICANT("01", "Postulante", "Persona que ha solicitado su ingreso a la institución", true),
    STUDENT("02", "Alumno", "Persona actualmente matriculada en la institución", true),
    TEACHER("03", "Docente", "Persona encargada de impartir clases", true),
    ADMIN("04", "Administrativo", "Persona encargada de labores administrativas", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}
