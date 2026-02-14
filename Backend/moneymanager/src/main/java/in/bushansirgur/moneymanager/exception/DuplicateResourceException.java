package in.bushansirgur.moneymanager.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a resource already exists (duplicate).
 */
public class DuplicateResourceException extends BaseException {

    public DuplicateResourceException(String message) {
        super(message, HttpStatus.CONFLICT, "DUPLICATE_RESOURCE");
    }

    public DuplicateResourceException(String resourceName, String field, String value) {
        super(resourceName + " with " + field + " '" + value + "' already exists", HttpStatus.CONFLICT, "DUPLICATE_RESOURCE");
    }
}

