package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.ExamFileType;

@Converter(autoApply = false)
public class ExamFileTypeConverter implements AttributeConverter<ExamFileType, String> {
    @Override
    public String convertToDatabaseColumn(ExamFileType attribute) {
        return attribute != null ? attribute.getCode() : null;
    }

    @Override
    public ExamFileType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        for (ExamFileType type : ExamFileType.values()) {
            if (type.getCode().equals(dbData)) return type;
        }
        throw new IllegalArgumentException("code ExamFileType desconocido: " + dbData);
    }
}