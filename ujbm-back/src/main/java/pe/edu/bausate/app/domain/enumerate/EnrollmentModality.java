package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EnrollmentModality implements DisplayableEnum {
    TITLED_GRADUATES("1", "Titulados o Graduados", "Personas con título profesional o grado académico.", true),
    INTERNAL_TRANSFERS("2", "Traslados Internos", "Estudiantes que se trasladan dentro de la misma institución.", true),
    EXTERNAL_TRANSFERS("3", "Traslados Externos", "Estudiantes provenientes de otras instituciones.", true),
    TOP_STUDENTS("4", "Primeros Puestos", "Estudiantes que ocuparon los primeros puestos en su promoción.", true),
    OUTSTANDING_ATHLETES("5", "Deportistas Destacados", "Estudiantes con logros deportivos destacados.", true),
    SCHOLARSHIPS("6", "Becas", "Estudiantes beneficiados con becas.", true),
    PEOPLE_WITH_DISABILITIES("7", "Personas con Discapacidad", "Estudiantes con algún tipo de discapacidad.", true),
    REGULAR_ORDINARY("8", "Regular - Ordinario", "Admisión regular por examen ordinario.", true),
    CEPRE("9", "CEPRE", "Estudiantes provenientes del Centro Preuniversitario.", true),
    NATIVE_COMMUNITIES("12", "Comunidades Nativas", "Estudiantes de comunidades nativas.", true),
    ARMED_FORCES("43", "Fuerzas Armadas", "Miembros de las Fuerzas Armadas.", true),
    TERRORISM_VICTIMS("14", "Víctimas de Terrorismo", "Personas afectadas por el terrorismo.", true),
    SCHOOL_PATHWAY("63", "Vía Escolar", "Estudiantes provenientes de colegios específicos.", true),
    WORKING_PEOPLE("69", "Gente que Trabaja", "Personas que trabajan y estudian.", true),
    OTHER_MODALITIES("10", "Otras Modalidades", "Modalidades de admisión no especificadas.", true);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean available;
}