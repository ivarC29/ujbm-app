package pe.edu.bausate.app.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record PersonResponse(

        @Schema(description = "Identificador de la persona.", example = "37")
        Long id,

        @Schema(description = "Nombres de la persona.", example = "Jordan Gabriel")
        String name,

        @Schema(description = "Apellidos de la persona.", example = "Salas Pineda")
        String lastname,

        @Schema(description = "Tipo de documentos de identidad", example = "DNI")
        String documentIdType,

        @Schema(description = "Número de documento de la persona.", example = "67838452")
        String documentNumber,

        @Schema(description = "Correo electronico de la persona.", example = "jgsalas@example.com")
        String email,

        @Schema(description = "Numero de celular de la persona.", example = "988674352")
        String phoneNumber,

        @Schema(description = "Direccion fisica de la persona.", example = "Av. Las palmeras, El ejemplo #28")
        String address,

        @Schema(description = "Fecha de nacimiento de la persona.", example = "03/09/1999")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
        LocalDate birthdate,

        @Schema(description = "Codigo de tipo al que pertenece la persona.", example = "01")
        String type,

        @Schema(description = "Tipo de inscripcion (Solo aplica a postulantes y estudiantes).", example = "01")
        String enrollmentMode,

        @Schema(description = "Ubigeo asociado a la persona.")
        UbigeoResponse ubigeo,

        @Schema(description = "Nombres del apoderado.", example = "Juanito")
        String guardianName,

        @Schema(description = "Apellidos del apoderado.", example = "Perez Galvez")
        String guardianLastname,

        @Schema(description = "Número de celular del apoderado.", example = "988674352")
        String guardianPhoneNumber,

        @Schema(description = "Correo electrónico del apoderado.", example = "papaperez@email.com")
        String guardianEmail,

        @Schema(description = "Indica si la persona tiene discapacidad", example = "true")
        boolean hasDisability,

        @Schema(description = "Tipo de discapacidad de la persona.", example = "Física")
        String disabilityType,

        @Schema(description = "Descripcion en caso de marcar otros.")
        String disabilityDescription,

        @Schema(description = "Codigo que identifica el genero.", example = "01")
        String gender,

        @Schema(description = "Indica si la persona está disponible", example = "true")
        Boolean available
) {
        // Constructor para usar el mapper de las respuestas de apis.net
        public PersonResponse(String name, String lastname, String documentIdType, String documentNumber, String address) {
                this(null, name, lastname, documentIdType, documentNumber, null, null, address, null, null, null, null, null, null, null, null, false, null, null, null, null);
        }
}
