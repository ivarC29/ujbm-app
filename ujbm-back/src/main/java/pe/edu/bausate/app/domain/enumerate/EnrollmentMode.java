package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EnrollmentMode implements DisplayableEnum{
    NO_ENROLLMENT("00","no matriculado","Modo para personas pertenecientes a la universidad que no son estudiantes.", 0,true),
    EXAM("01","examen ordinario","Examen de admisión.", 25,true),
    PREFERENTIAL("02","evaluación preferente","Dirigido para jóvenes que están cursando el 5to. Año de Educación Secundaria.", 14 ,true),
    EXEMPTED("03","exonerados","Alumnos con bachiller, deportistas, fuerzas armadas, etc.", 9,true),
    TRANSFER("04","traslado","Alumnos provenientes de otras universidades.", 9,true),
    PRE("05","Pre Bausate","Alumnos inscritos al periodo pre-universitario.", 10, false);

    private final String code;
    private final String displayName;
    private final String description;
    private final Integer minimumScore;
    private final boolean available;
}
