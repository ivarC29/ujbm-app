package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.Gender;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;

@Converter(autoApply = true)
public class GenderConverter implements AttributeConverter<Gender, String> {

    @Override
    public String convertToDatabaseColumn(Gender attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public Gender convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(Gender.class, dbData);
    }
}