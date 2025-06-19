package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.QuestionType;

@Converter(autoApply = false)
public class QuestionTypeConverter implements AttributeConverter<QuestionType, String> {
    @Override
    public String convertToDatabaseColumn(QuestionType attribute) {
        return attribute != null ? attribute.getCode() : null;
    }

    @Override
    public QuestionType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        for (QuestionType type : QuestionType.values()) {
            if (type.getCode().equals(dbData)) return type;
        }
        throw new IllegalArgumentException("Unknown QuestionType code: " + dbData);
    }
}
