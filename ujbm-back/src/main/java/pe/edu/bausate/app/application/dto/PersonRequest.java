package pe.edu.bausate.app.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.edu.bausate.app.infraestructure.annotation.ValidDocumentNumber;

import java.time.LocalDate;

@Schema(description = "Datos para crear persona")
@ValidDocumentNumber
public record PersonRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Schema(description = "Nombres de la persona.", example = "Jordan Gabriel")
        String name,

        @NotBlank(message = "El apellido es obligatorio")
        @Schema(description = "Apellidos de la persona.", example = "Salas Pineda")
        String lastname,

        @NotNull(message = "El tipo de documento es obligatorio")
        @Schema(description = "Tipo de documentos de identidad", example = "DNI")
        String documentIdType,

        @NotBlank(message = "El número de documento es obligatorio")
        @Schema(description = "Número de documento de la persona.", example = "67838452")
        String documentNumber,

        @Email(message = "Correo electrónico inválido")
        @NotBlank(message = "El correo electronico es obligatorio")
        @Schema(description = "Correo electronico de la persona.", example = "jgsalas@example.com")
        String email,

        @NotBlank(message = "El número de celular es obligatorio")
        @Schema(description = "Numero de celular de la persona.", example = "988674352")
        String phoneNumber,

        @Schema(description = "Direccion fisica de la persona.", example = "Av. Las palmeras, El ejemplo #28")
        String address,

        @NotNull(message = "La fecha de nacimiento es obligatoria")
        @Schema(description = "Fecha de nacimiento de la persona.", example = "03/09/1999")
        LocalDate birthdate,

        @Schema(description = "Codigo de tipo al que pertenece la persona.", example = "01")
        String type,

        @Schema(description = "Tipo de inscripcion (Solo aplica a postulantes y estudiantes).", example = "01")
        String enrollmentMode,

        @NotNull(message = "El ubigeo es obligatorio")
        @Schema(description = "Ubigeo asociado a la persona.")
        UbigeoRequest ubigeo,

        @Schema(description = "Nombres del apoderado.", example = "Juanito")
        String guardianName,

        @Schema(description = "Apellidos del apoderado.", example = "Perez Galvez")
        String guardianLastname,

        @Schema(description = "Número de celular del apoderado.", example = "988674352")
        String guardianPhoneNumber,

        @Schema(description = "Correo electrónico del apoderado.", example = "papaperez@email.com")
        String guardianEmail,

        @NotNull(message = "Indicar si tiene discapacidad es obligatorio")
        @Schema(description = "Indica si la persona tiene discapacidad", example = "true")
        boolean hasDisability,

        @Schema(description = "Indica si la persona está disponible", example = "true")
        String disabilityType,

        @Schema(description = "Indica si que discapacidad tiene la persona en caso marcar otros.")
        String disabilityDescription,

        @NotNull(message = "Indicar el genero es obligatorio")
        @Schema(description = "Codigo que identifica el genero", example = "01")
        String gender,

        @Schema(description = "Indica si la persona está disponible", example = "true")
        Boolean available
) {}
