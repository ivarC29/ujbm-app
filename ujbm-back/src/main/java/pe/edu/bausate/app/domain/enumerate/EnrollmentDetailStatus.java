package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

@Getter
@RequiredArgsConstructor
public enum EnrollmentDetailStatus implements DisplayableEnum{
    NOT_REGISTERED("00", "No registrado", "Curso no registrado por el estudiante", true),
    REGISTERED("01", "Registrado", "Curso registrado por el estudiante", true),
    WITHDRAWN("02", "Retirado", "Curso retirado por el estudiante", true),
    APPROVED("03", "Aprobado", "Curso aprobado satisfactoriamente", true),
    DISAPPROVED("04", "Desaprobado", "Curso no aprobado por el estudiante", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}
