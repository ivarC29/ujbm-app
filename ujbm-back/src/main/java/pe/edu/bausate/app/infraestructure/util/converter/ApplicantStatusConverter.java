package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.ApplicantStatus;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;

@Converter(autoApply = true)
public class ApplicantStatusConverter implements AttributeConverter<ApplicantStatus, String> {
    @Override
    public String convertToDatabaseColumn(ApplicantStatus attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public ApplicantStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(ApplicantStatus.class, dbData);
    }
}
