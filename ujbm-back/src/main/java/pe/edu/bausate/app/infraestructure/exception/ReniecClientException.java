package pe.edu.bausate.app.infraestructure.exception;

import lombok.Getter;

@Getter
public class ReniecClientException extends RuntimeException {
    private final int statusCode;
    private final String message;

    public ReniecClientException(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }
}
