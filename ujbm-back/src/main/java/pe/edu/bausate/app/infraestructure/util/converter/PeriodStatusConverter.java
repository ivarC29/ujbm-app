package pe.edu.bausate.app.infraestructure.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;
import pe.edu.bausate.app.domain.enumerate.PeriodStatus;

@Converter(autoApply = true)
public class PeriodStatusConverter implements AttributeConverter<PeriodStatus, String> {
    @Override
    public String convertToDatabaseColumn(PeriodStatus attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public PeriodStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : DisplayableEnum.fromCode(PeriodStatus.class, dbData);
    }
}
