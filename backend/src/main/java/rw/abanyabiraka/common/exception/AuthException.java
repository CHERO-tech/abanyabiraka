package rw.abanyabiraka.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Expected, user-facing auth failures (bad credentials, expired/wrong OTP, duplicate
 * email, disabled account). Caught by {@link GlobalExceptionHandler} and turned into a
 * clean JSON error instead of a 500.
 */
public class AuthException extends RuntimeException {

    private final HttpStatus status;

    public AuthException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
