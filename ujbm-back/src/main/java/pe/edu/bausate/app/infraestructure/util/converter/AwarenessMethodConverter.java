package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.AwarenessMethod;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;

@Converter(autoApply = true)
public class AwarenessMethodConverter implements AttributeConverter<AwarenessMethod, String> {

    @Override
    public String convertToDatabaseColumn(AwarenessMethod attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public AwarenessMethod convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(AwarenessMethod.class, dbData);
    }
}