package pe.edu.bausate.app.infraestructure.exception;

public class DuplicateDniException extends RuntimeException{
    public DuplicateDniException(String message) {
        super(message);
    }
}
