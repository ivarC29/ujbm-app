package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;
import pe.edu.bausate.app.domain.enumerate.EnrollmentMode;

@Converter(autoApply = true)
public class EnrollmentModeConverter implements AttributeConverter<EnrollmentMode, String> {
    @Override
    public String convertToDatabaseColumn(EnrollmentMode attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public EnrollmentMode convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(EnrollmentMode.class, dbData);
    }
}
