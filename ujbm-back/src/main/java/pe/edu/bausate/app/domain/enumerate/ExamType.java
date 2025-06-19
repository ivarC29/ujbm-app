package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ExamType implements DisplayableEnum {
    QUIZ("01", "Quiz", "Evaluación corta para medir conocimientos específicos", true),
    MIDTERM("02", "Parcial", "Evaluación intermedia del periodo académico", true),
    FINAL("03", "Final", "Evaluación al término del periodo académico", true),
    ASSIGNMENT("04", "Tarea", "Trabajo asignado para realizar fuera de clase", true),
    PRACTICE("05", "Práctica", "Ejercicio para reforzar conocimientos", true),
    ADMISSION("06", "Admisión", "Examen para ingreso a la institución", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}
