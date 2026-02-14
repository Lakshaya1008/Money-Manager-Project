package in.bushansirgur.moneymanager.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when user is not authorized to perform an action.
 */
public class UnauthorizedException extends BaseException {

    public UnauthorizedException(String message) {
        super(message, HttpStatus.FORBIDDEN, "UNAUTHORIZED");
    }

    public UnauthorizedException(String action, String resource) {
        super("You are not authorized to " + action + " this " + resource, HttpStatus.FORBIDDEN, "UNAUTHORIZED");
    }
}

