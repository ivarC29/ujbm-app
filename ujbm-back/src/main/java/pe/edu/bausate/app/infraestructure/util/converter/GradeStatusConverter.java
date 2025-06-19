package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.GradeStatus;

@Converter(autoApply = false)
public class GradeStatusConverter implements AttributeConverter<GradeStatus, String> {
    @Override
    public String convertToDatabaseColumn(GradeStatus attribute) {
        return attribute != null ? attribute.getCode() : null;
    }

    @Override
    public GradeStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        for (GradeStatus status : GradeStatus.values()) {
            if (status.getCode().equals(dbData)) return status;
        }
        throw new IllegalArgumentException("Unknown GradeStatus code: " + dbData);
    }
}