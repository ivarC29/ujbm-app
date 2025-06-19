package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.ExamStatus;

@Converter(autoApply = false)
public class ExamStatusConverter implements AttributeConverter<ExamStatus, String> {
    @Override
    public String convertToDatabaseColumn(ExamStatus attribute) {
        return attribute != null ? attribute.getCode() : null;
    }

    @Override
    public ExamStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        for (ExamStatus status : ExamStatus.values()) {
            if (status.getCode().equals(dbData)) return status;
        }
        throw new IllegalArgumentException("Unknown ExamStatus code: " + dbData);
    }
}