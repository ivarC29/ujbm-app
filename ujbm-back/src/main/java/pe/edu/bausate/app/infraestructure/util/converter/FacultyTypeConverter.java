package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;
import pe.edu.bausate.app.domain.enumerate.FacultyType;

@Converter(autoApply = true)
public class FacultyTypeConverter implements AttributeConverter<FacultyType, String> {
    @Override
    public String convertToDatabaseColumn(FacultyType attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public FacultyType convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(FacultyType.class, dbData);
    }
}