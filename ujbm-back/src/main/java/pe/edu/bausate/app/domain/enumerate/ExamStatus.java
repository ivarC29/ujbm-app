package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ExamStatus implements DisplayableEnum {
    DRAFT("01", "Borrador", "Examen en proceso de creación", true),
    PUBLISHED("02", "Publicado", "Examen visible para estudiantes pero no disponible", true),
    ACTIVE("03", "Activo", "Examen disponible para ser tomado", true),
    CLOSED("04", "Cerrado", "Examen finalizado, no disponible para nuevos intentos", true),
    ARCHIVED("05", "Archivado", "Examen almacenado para fines históricos", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}
