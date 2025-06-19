package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;
import pe.edu.bausate.app.domain.enumerate.DocumentIdType;

@Converter(autoApply = true)
public class DocumentTypeConverter implements AttributeConverter<DocumentIdType, String> {
    @Override
    public String convertToDatabaseColumn(DocumentIdType attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public DocumentIdType convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(DocumentIdType.class, dbData);
    }
}
