package pe.edu.bausate.app.infraestructure.exception;

public class JwtTokenException extends RuntimeException{
    public JwtTokenException(String message) {
        super(message);
    }
}
