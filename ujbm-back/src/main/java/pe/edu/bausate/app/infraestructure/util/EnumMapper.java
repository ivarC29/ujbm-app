package pe.edu.bausate.app.infraestructure.util;

import org.springframework.stereotype.Component;
import pe.edu.bausate.app.application.dto.EnumOptionResponse;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EnumMapper {
    public List<EnumOptionResponse> mapEnum(Class<? extends Enum<?>> enumClass) {
        if (!DisplayableEnum.class.isAssignableFrom(enumClass)) {
            throw new IllegalArgumentException("El enum debe implementar DisplayableEnum.");
        }

        return Arrays.stream(enumClass.getEnumConstants())
                .map(e -> (DisplayableEnum) e)
                .filter(DisplayableEnum::isAvailable) // Filtrar solo los disponibles
                .map(de -> new EnumOptionResponse(de.getCode(), de.getDisplayName(), de.getDescription()))
                .collect(Collectors.toList());
    }
}
