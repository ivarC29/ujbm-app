package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;
import pe.edu.bausate.app.domain.enumerate.EnrollmentStatus;

@Converter(autoApply = true)
public class EnrollmentStatusConverter implements AttributeConverter<EnrollmentStatus, String> {
    @Override
    public String convertToDatabaseColumn(EnrollmentStatus attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public EnrollmentStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(EnrollmentStatus.class, dbData);
    }
}
