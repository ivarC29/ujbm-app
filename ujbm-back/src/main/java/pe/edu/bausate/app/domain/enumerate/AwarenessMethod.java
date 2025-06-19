package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AwarenessMethod implements DisplayableEnum {
    SOCIAL_MEDIA("01", "Redes Sociales", "Se enteró a través de redes sociales", true),
    FRIENDS_OR_FAMILY("02", "Amigos o Familia", "Se enteró por recomendación de amigos o familiares", true),
    ADVERTISING("03", "Publicidad", "Se enteró por publicidad en medios", true),
    SCHOOL_VISIT("04", "Visita Escolar", "Se enteró por una visita de la universidad a su colegio", true),
    OTHER("05", "Otro", "Otro medio no especificado", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}