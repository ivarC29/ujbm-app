package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.AppointmentStatus;

@Converter(autoApply = false)
public class AppointmentStatusConverter implements AttributeConverter<AppointmentStatus, String> {
    @Override
    public String convertToDatabaseColumn(AppointmentStatus attribute) {
        return attribute != null ? attribute.getCode() : null;
    }

    @Override
    public AppointmentStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        for (AppointmentStatus status : AppointmentStatus.values()) {
            if (status.getCode().equals(dbData)) return status;
        }
        throw new IllegalArgumentException("Desconocido code: " + dbData);
    }
}
