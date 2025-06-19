package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;
import pe.edu.bausate.app.domain.enumerate.ValueType;

@Converter(autoApply = true)
public class ValueTypeConverter implements AttributeConverter<ValueType, String> {
    @Override
    public String convertToDatabaseColumn(ValueType attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public ValueType convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(ValueType.class, dbData);
    }
}