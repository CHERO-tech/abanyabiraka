package rw.abanyabiraka.common.exception;

/** Thrown when a requested resource (worker, category, profession...) doesn't exist. */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}