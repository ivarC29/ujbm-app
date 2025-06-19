package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ExamFileType implements DisplayableEnum {
    QUESTION_RESOURCE("01", "Recurso de pregunta", "Archivo asociado a una pregunta específica", true),
    ANSWER("02", "Respuesta", "Archivo subido como respuesta por el estudiante", true),
    SOLUTION("03", "Solución", "Archivo con la solución del examen", true),
    INSTRUCTIONS("04", "Instrucciones", "Archivo con instrucciones del examen", true),

    EXAM_CONTENT("05", "Contenido del examen", "Archivo con el contenido del examen", true),
    QUESTION_CONTENT("06", "Contenido de pregunta", "Archivo con el contenido de una pregunta", true),
    ANSWER_CONTENT("07", "Contenido de respuesta", "Archivo con el contenido de una respuesta", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}