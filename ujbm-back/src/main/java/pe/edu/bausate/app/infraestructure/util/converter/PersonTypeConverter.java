package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;
import pe.edu.bausate.app.domain.enumerate.PersonType;

@Converter(autoApply = true)
public class PersonTypeConverter implements AttributeConverter<PersonType, String> {
    @Override
    public String convertToDatabaseColumn(PersonType attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public PersonType convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(PersonType.class, dbData);
    }
}
