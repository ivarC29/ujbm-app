package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

@Getter
@RequiredArgsConstructor
public enum AppointmentStatus implements DisplayableEnum {
    SCHEDULED("01", "Programada", "La entrevista ha sido programada", true),
    COMPLETED("02", "Completada", "La entrevista se realizó satisfactoriamente", true),
    CANCELLED("03", "Cancelada", "La entrevista fue cancelada", true),
    MISSED("04", "No asistió", "El postulante no se presentó a la entrevista", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;

    public static AppointmentStatus fromCode(String code) {
        return Arrays.stream(AppointmentStatus.values())
                .filter(status -> status.getCode().equals(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid status code: " + code));
    }
}