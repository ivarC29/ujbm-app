package pe.edu.bausate.app.infraestructure.util.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import pe.edu.bausate.app.application.dto.PersonRequest;
import pe.edu.bausate.app.domain.enumerate.DisplayableEnum;
import pe.edu.bausate.app.domain.enumerate.DocumentIdType;
import pe.edu.bausate.app.infraestructure.annotation.ValidDocumentNumber;

public class DocumentNumberValidator implements ConstraintValidator<ValidDocumentNumber, PersonRequest> {
    @Override
    public boolean isValid(PersonRequest request, ConstraintValidatorContext context) {
        if (request == null || request.documentIdType() == null || request.documentNumber() == null) {
            return true;
        }

        DocumentIdType type = DisplayableEnum.fromCode(DocumentIdType.class, request.documentIdType());
        String number = request.documentNumber();

        boolean valid;

        if (type.getType() == 5) {
            valid = number.matches("\\d+");
        } else {
            valid = number.matches("[A-Za-z0-9]+");
        }

        if (!valid) return false;

        if (type.getExactLengthIndicator() == 1) {
            return number.length() == type.getLength();
        } else {
            return number.length() <= type.getLength();
        }
    }
}
