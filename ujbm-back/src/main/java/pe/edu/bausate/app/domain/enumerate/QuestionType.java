package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum QuestionType implements DisplayableEnum {
    MULTIPLE_CHOICE("01", "Opción múltiple", "Pregunta con varias opciones y una o más respuestas correctas", true),
    TRUE_FALSE("02", "Verdadero/Falso", "Pregunta con opciones verdadero o falso", true),
    ESSAY("03", "Ensayo", "Pregunta que requiere una respuesta extensa", true),
    FILE_UPLOAD("04", "Subida de archivo", "Pregunta que requiere la subida de un archivo", true),
    SHORT_ANSWER("05", "Respuesta corta", "Pregunta que requiere una respuesta breve", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}