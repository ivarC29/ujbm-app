package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;
import pe.edu.bausate.app.domain.enumerate.EnrollmentDetailStatus;

@Converter(autoApply = true)
public class EnrollmentDetailStatusConverter implements AttributeConverter<EnrollmentDetailStatus, String> {
    @Override
    public String convertToDatabaseColumn(EnrollmentDetailStatus attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public EnrollmentDetailStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(EnrollmentDetailStatus.class, dbData);
    }
}
