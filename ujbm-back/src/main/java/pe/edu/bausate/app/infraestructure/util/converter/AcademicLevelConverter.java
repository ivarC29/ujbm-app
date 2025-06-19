package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.AcademicLevel;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;

@Converter(autoApply = true)
public class AcademicLevelConverter implements AttributeConverter<AcademicLevel, String> {
    @Override
    public String convertToDatabaseColumn(AcademicLevel attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public AcademicLevel convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(AcademicLevel.class, dbData);
    }
}