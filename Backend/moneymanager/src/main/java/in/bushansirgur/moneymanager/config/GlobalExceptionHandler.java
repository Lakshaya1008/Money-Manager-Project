package in.bushansirgur.moneymanager.config;

import in.bushansirgur.moneymanager.exception.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler for consistent error responses across all controllers.
 * Ensures no sensitive information is leaked in error responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ============ Custom Application Exceptions ============

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<Map<String, Object>> handleBaseException(BaseException ex) {
        return buildErrorResponse(ex.getStatus(), ex.getMessage(), ex.getErrorCode());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return buildErrorResponse(ex.getStatus(), ex.getMessage(), ex.getErrorCode());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateResourceException(DuplicateResourceException ex) {
        return buildErrorResponse(ex.getStatus(), ex.getMessage(), ex.getErrorCode());
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(ValidationException ex) {
        return buildErrorResponse(ex.getStatus(), ex.getMessage(), ex.getErrorCode());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedException(UnauthorizedException ex) {
        return buildErrorResponse(ex.getStatus(), ex.getMessage(), ex.getErrorCode());
    }

    @ExceptionHandler(in.bushansirgur.moneymanager.exception.AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleCustomAuthenticationException(
            in.bushansirgur.moneymanager.exception.AuthenticationException ex) {
        return buildErrorResponse(ex.getStatus(), ex.getMessage(), ex.getErrorCode());
    }

    // ============ Spring Security Exceptions ============

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), "USER_NOT_FOUND");
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Invalid email or password. Please check your credentials and try again.", "INVALID_CREDENTIALS");
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, Object>> handleDisabledException(DisabledException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Account is not activated. Please check your email for the activation link.", "ACCOUNT_NOT_ACTIVATED");
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<Map<String, Object>> handleLockedException(LockedException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Account is locked. Please contact support for assistance.", "ACCOUNT_LOCKED");
    }

    // ============ Validation Exceptions ============

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        StringBuilder errors = new StringBuilder();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            if (errors.length() > 0) errors.append("; ");
            errors.append(error.getField()).append(": ").append(error.getDefaultMessage());
        });
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Validation failed: " + errors, "VALIDATION_ERROR");
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingServletRequestParameterException(
            MissingServletRequestParameterException ex) {
        String message = "Required parameter '" + ex.getParameterName() + "' is missing";
        return buildErrorResponse(HttpStatus.BAD_REQUEST, message, "MISSING_PARAMETER");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException ex) {
        String message = "Invalid value for parameter '" + ex.getName() + "'. Expected type: " +
                        (ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        return buildErrorResponse(HttpStatus.BAD_REQUEST, message, "INVALID_PARAMETER_TYPE");
    }

    // ============ Generic Exceptions ============

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), "INVALID_ARGUMENT");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        logger.error("Runtime exception occurred: {}", ex.getMessage(), ex);
        // Return generic message to avoid leaking internal details
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "An error occurred while processing your request. Please try again.", "RUNTIME_ERROR");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        // Log the full exception for debugging (not exposed to client)
        logger.error("Unexpected error occurred: {}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred. Please try again later or contact support if the problem persists.",
            "INTERNAL_ERROR");
    }

    // ============ Helper Methods ============

    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message, String errorCode) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        if (errorCode != null) {
            body.put("errorCode", errorCode);
        }
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }

    // Overloaded method for backwards compatibility
    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message) {
        return buildErrorResponse(status, message, null);
    }
}

