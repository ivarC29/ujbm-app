package pe.edu.bausate.app.infraestructure.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import pe.edu.bausate.app.infraestructure.util.validator.DocumentNumberValidator;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = DocumentNumberValidator.class)
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidDocumentNumber {
    String message() default "Invalid document number for the selected document type";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
