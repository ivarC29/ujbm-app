package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DisabilityType implements DisplayableEnum {
    MOTOR_DISABILITY("1", "Discapacidad Motriz", "Dificultad para moverse o realizar actividades físicas.", true),
    VISUAL_DISABILITY("2", "Discapacidad Visual", "Pérdida total o parcial de la visión.", true),
    VISUAL_AND_BODY_SCHEME("3", "Visual y Esquema Corporal", "Alteraciones en la percepción visual y corporal.", true),
    VISUALLY_IMPAIRED("4", "Disminuidos Visuales", "Personas con visión reducida.", true),
    HEARING_DISABILITY("5", "Discapacidad Auditiva", "Pérdida total o parcial de la audición.", true),
    AUTISM("6", "Autismo", "Trastorno del espectro autista.", true),
    MENTAL_DISABILITY("7", "Discapacidad Mental", "Limitaciones en el desarrollo mental.", true),
    CEREBRAL_PALSY("8", "Parálisis Cerebral", "Trastorno que afecta el movimiento y la postura.", true),
    INTELLECTUAL_DISABILITY("9", "Discapacidad Intelectual", "Limitaciones significativas en el funcionamiento intelectual.", true),
    DEAFBLINDNESS("10", "Sordoceguera", "Combinación de discapacidad visual y auditiva.", true),
    NO_INFORMATION("11", "No Cuenta con Información", "No se dispone de información sobre la discapacidad.", true),
    OTHER("12", "Otros", "Otro tipo de discapacidad no especificada.", true),
    ASPERGER_SYNDROME("13", "Sindrome de Asperger", "Trastorno del espectro autista de alto funcionamiento.", true),
    UNIDENTIFIED_HEMIPLEGIA("14", "Hemiplejia no Identificada", "Parálisis de un lado del cuerpo sin causa identificada.", true),
    CONGENITAL_AORTIC_STENOSIS("15", "Estenosis Congénita de la Válvula Aortica", "Condición cardíaca congénita.", true),
    MULTIPLE_DISABILITIES("16", "Multidiscapacidad", "Combinación de dos o más discapacidades.", true),
    PHYSICAL_DISABILITY("17", "Discapacidad Fisica", "Limitaciones físicas que afectan la movilidad.", true),
    AUTISM_SPECTRUM_DISORDER("18", "Transtorno del Espectro Autista", "Trastorno que afecta la comunicación y el comportamiento.", true),
    ADHD("19", "T. por Déficit de Atención con Hiperactividad", "Trastorno de atención con hiperactividad.", true),
    SPECIFIC_LEARNING_DISORDER("20", "T. Especifico del Aprendizaje", "Dificultades específicas en el aprendizaje.", true),
    MENTAL_AND_BEHAVIORAL_DISORDERS("21", "T. Mentales y del Comportamiento", "Trastornos que afectan la salud mental y el comportamiento.", true),
    RARE_DISEASES("22", "Enfermedades Raras", "Enfermedades poco comunes.", true),
    SHORT_STATURE("23", "Talla Baja", "Estatura significativamente menor al promedio.", true),
    TALENT("24", "Talento", "Habilidad o aptitud sobresaliente.", true),
    GIFTEDNESS("25", "Superdotación", "Capacidades intelectuales significativamente superiores.", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}