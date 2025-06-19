package pe.edu.bausate.app.infraestructure.util.helper;

import pe.edu.bausate.app.domain.enumerate.ValueType;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SystemParameterUtils {
    public static ValueType inferValueType(String value) {
        if (value.equalsIgnoreCase("true") || value.equalsIgnoreCase("false")) return ValueType.BOOLEAN;
        try { Integer.parseInt(value); return ValueType.INTEGER; } catch (Exception ignored) {}
        try { new BigDecimal(value); return ValueType.DECIMAL; } catch (Exception ignored) {}
        try { LocalDate.parse(value); return ValueType.DATE; } catch (Exception ignored) {}
        return ValueType.STRING;
    }

    public static Object convertToTypedValue(String value, ValueType type) {
        return switch (type) {
            case STRING -> value;
            case BOOLEAN -> Boolean.parseBoolean(value);
            case INTEGER -> Integer.parseInt(value);
            case DECIMAL -> new BigDecimal(value);
            case DATE -> LocalDate.parse(value);
        };
    }
}
