package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.DisabilityType;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;

@Converter(autoApply = true)
public class DisabilityTypeConverter implements AttributeConverter<DisabilityType, String> {
    @Override
    public String convertToDatabaseColumn(DisabilityType attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public DisabilityType convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(DisabilityType.class, dbData);
    }
}
