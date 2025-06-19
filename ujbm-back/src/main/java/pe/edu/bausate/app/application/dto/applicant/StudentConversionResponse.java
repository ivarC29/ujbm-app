package pe.edu.bausate.app.application.dto.applicant;

import pe.edu.bausate.app.domain.models.Student;

import java.time.LocalDate;

public record StudentConversionResponse(
        Long id,
        String codigo,
        String nombreCompleto,
        String programa,
        LocalDate fechaMatricula,
        Integer ciclo,
        String mensaje
) {
    // TODO: Pasar a un mapper
    /**
     * Convierte un objeto Student a un objeto StudentConversionResponse.
     *
     * @param student El objeto Student a convertir.
     * @return Un nuevo objeto StudentConversionResponse con los datos del estudiante.
     */
    public static StudentConversionResponse fromStudent(Student student) {

        return new StudentConversionResponse(
                student.getId(),
                student.getCode(),
                student.getPerson().getName() + " " + student.getPerson().getLastname(),
                student.getProgram().getName(),
                student.getEnrollmentDate(),
                student.getCycle(),
                "Conversión a estudiante realizada exitosamente"
        );
    }
}
