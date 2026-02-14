package in.bushansirgur.moneymanager.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when request validation fails.
 */
public class ValidationException extends BaseException {

    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    public ValidationException(String field, String reason) {
        super("Validation failed for field '" + field + "': " + reason, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }
}

