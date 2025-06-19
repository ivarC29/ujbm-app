package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;
import pe.edu.bausate.app.domain.enumerate.HighSchoolType;

@Converter(autoApply = true)
public class HighSchoolTypeConverter implements AttributeConverter<HighSchoolType, String> {
    @Override
    public String convertToDatabaseColumn(HighSchoolType attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public HighSchoolType convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(HighSchoolType.class, dbData);
    }
}
