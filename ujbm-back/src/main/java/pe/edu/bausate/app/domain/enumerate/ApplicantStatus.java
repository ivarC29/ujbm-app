package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

@Getter
@RequiredArgsConstructor
public enum ApplicantStatus implements DisplayableEnum {
    PENDING("01", "Pendiente", "Solicitud en espera de revisión", true),
    APPROVED("02", "Aprobado", "Solicitud aprobada satisfactoriamente", true),
    REJECTED("03", "Rechazado", "Solicitud denegada tras revisión", true),
    UNDER_REVIEW("04", "En revisión", "Solicitud en proceso de revisión", true),
    INCOMPLETE("05", "Incompleta", "Solicitud incompleta, falta información", true);


    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}
