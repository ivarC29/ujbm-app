package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.ScheduleType;

@Converter(autoApply = false)
public class ScheduleTypeConverter implements AttributeConverter<ScheduleType, String> {
    @Override
    public String convertToDatabaseColumn(ScheduleType attribute) {
        return attribute != null ? attribute.getCode() : null;
    }

    @Override
    public ScheduleType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        for (ScheduleType type : ScheduleType.values()) {
            if (type.getCode().equals(dbData)) return type;
        }
        throw new IllegalArgumentException("Unknown ScheduleType code: " + dbData);
    }
}
