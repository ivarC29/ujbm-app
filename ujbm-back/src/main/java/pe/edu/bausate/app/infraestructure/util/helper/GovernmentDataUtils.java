package pe.edu.bausate.app.infraestructure.util.helper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Utilidades para formatear y transformar datos provenientes de fuentes gubernamentales,
 * como RENIEC u otras entidades del estado.
 */
public class GovernmentDataUtils {
    public record SeparatedName(String givenNames, String surnames) {}

    /**
     * Separa un nombre completo en apellidos y nombres, asumiendo que los dos primeros componentes
     * son apellidos y el resto son nombres.
     * Ejemplo: "CHAVEZ CAVERO NOLDIA" → apellidos: "CHAVEZ CAVERO", nombres: "NOLDIA"
     *          "SALAS PINEDA JORDAN GABRIEL" → apellidos: "SALAS PINEDA", nombres: "JORDAN GABRIEL"
     *
     * @param fullName El nombre completo en mayúsculas, separado por espacios.
     * @return Un objeto con nombres y apellidos por separado.
     */
    public static SeparatedName splitFullName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new SeparatedName("", "");
        }

        String[] parts = fullName.trim().split("\\s+");
        if (parts.length < 3) {
            return new SeparatedName(fullName.trim(), "");
        }

        String surnames = parts[0] + " " + parts[1];
        String givenNames = Arrays.stream(parts, 2, parts.length)
                .collect(Collectors.joining(" "));

        return new SeparatedName(givenNames, surnames);
    }

    /**
     * Formatea el tipo de documento de identidad. Si el tipo tiene un solo dígito, le antepone un cero.
     * Ejemplo: "1" → "01", "06" → "06"
     *
     * @param tipoDocumento El tipo de documento como cadena.
     * @return El tipo de documento formateado a dos dígitos, o null si es null.
     */
    public static String formatDocType(String tipoDocumento) {
        if (tipoDocumento == null) return null;
        return tipoDocumento.length() == 1 ? "0" + tipoDocumento : tipoDocumento;
    }

    /**
     * Capitaliza cada palabra del texto. Convierte el resto de cada palabra a minúsculas.
     * Ejemplo: "CHAVEZ CAVERO" → "Chavez Cavero", "noldia" → "Noldia"
     *
     * @param input Texto a capitalizar.
     * @return Texto con cada palabra capitalizada.
     */
    public static String capitalize(String input) {
        if (input == null || input.isBlank()) return input;
        return Arrays.stream(input.toLowerCase().split(" "))
                .map(word -> word.isEmpty() ? word : Character.toUpperCase(word.charAt(0)) + word.substring(1))
                .collect(Collectors.joining(" "));
    }

    /**
     * Extrae solo el mensaje de un json
     * Ejemplo: "message: some error" → "some error"
     *
     * @param json Json con mensaje.
     * @return Solo el mensaje del json enviado.
     */
    public static String extractMessage(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(json);
            return node.has("message") ? node.get("message").asText() : "Error desconocido";
        } catch (Exception ex) {
            return "Error desconocido";
        }
    }


}
