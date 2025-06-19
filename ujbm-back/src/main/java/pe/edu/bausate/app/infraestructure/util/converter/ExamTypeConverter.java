package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.ExamType;

@Converter(autoApply = false)
public class ExamTypeConverter implements AttributeConverter<ExamType, String> {
    @Override
    public String convertToDatabaseColumn(ExamType attribute) {
        return attribute != null ? attribute.getCode() : null;
    }

    @Override
    public ExamType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        for (ExamType type : ExamType.values()) {
            if (type.getCode().equals(dbData)) return type;
        }
        throw new IllegalArgumentException("ExamType codigo desconocido: " + dbData);
    }
}
