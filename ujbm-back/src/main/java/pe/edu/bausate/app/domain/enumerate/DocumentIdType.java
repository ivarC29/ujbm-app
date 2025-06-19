package pe.edu.bausate.app.domain.enumerate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DocumentIdType implements DisplayableEnum{
    // Se utiliza el orden de maestros proporcionado por la universidad manteniendo los datos manejado por reniec
    DNI("01", "DNI", "NATIONAL_ID", "L.E. / DNI", 8, 5, 0, 0, 1, 1, "Documento Nacional de Identidad", true),
    PASSPORT("07", "Pasaporte", "PASSPORT", "PASAPORTE", 12, 0, 2, 0, 0, 2, "Pasaporte", true),
    FOREIGN_CARD("04", "Carnet de extranjería", "FOREIGN_CARD", "CARNET EXT.", 12, 0, 2, 0, 0, 3, "Carné de Extranjería", true),
    NATIONAL_ID("08", "Cédula de identidad", "Cédula de identidad", "Cédula de identidad", 15, 0, 1, 0, 0, 4, "Cédula de identidad", true),
    OTHER("00", "Otros", "OTHER", "OTROS", 15, 0, 1, 0, 0, 5,"Documento Extranjero - Otros", true),
    TEMP("16", "Permiso Temporal de Permanencia", "Permiso Temporal de Permanencia", "Permiso Temporal de Permanencia", 15, 0, 1, 0, 0, 6,"Permiso Temporal de Permanencia", true),
    NATIONAL_ID2("17", "Carné de Identidad", "Carné de Identidad", "Carné de Identidad", 15, 0, 1, 0, 0, 7,"Carné de Identidad", true),
    NATIONAL_ID3("18", "Cédula de Ciudadanía", "Cédula de Ciudadanía", "Cédula de Ciudadanía", 15, 0, 1, 0, 0, 8,"Cédula de Ciudadanía", true),
    TEMP2("19", "Carné Temporal de Permanencia", "Carné Temporal de Permanencia", "Carné Temporal de Permanencia", 15, 0, 1, 0, 0, 9,"Carné Temporal de Permanencia", true),
    // Presentes en documentación SUNAT pero no incluida en los maestros:
    TAX_ID("06", "RUC", "TAX_ID", "RUC", 11, 5, 0, 1, 0, 0, "", true),
    BIRTH_CERTIFICATE("11", "Partida de nacimiento", "BIRTH_CERTIFICATE", "P. NAC.", 15, 0, 0, 0, 0, 0,"", false);

    private final String code;
    private final String displayName;
    private final String description;
    private final String shortDescription;
    private final int length;
    private final int type; // 5: Numeric, 0: Alphanumeric
    private final int citizenScope; // 0: National, 1: Foreign, 2: Both
    private final int contributorIndicator;
    private final int exactLengthIndicator;
    private final int codeSUNEDU;
    private final String descSUNEDU;
    private final boolean available;
}
