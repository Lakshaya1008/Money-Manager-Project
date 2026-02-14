package in.bushansirgur.moneymanager.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Custom authentication entry point that returns a proper JSON response
 * when authentication fails or no authentication is provided.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        String message;
        String errorCode;
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null) {
            message = "Authentication token is missing. Please provide a valid JWT token in the Authorization header.";
            errorCode = "AUTH_TOKEN_MISSING";
        } else if (!authHeader.startsWith("Bearer ")) {
            message = "Invalid Authorization header format. Expected 'Bearer <token>'";
            errorCode = "AUTH_TOKEN_INVALID";
        } else {
            message = "Invalid authentication token. Please login again to get a new token.";
            errorCode = "AUTH_TOKEN_INVALID";
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.UNAUTHORIZED.value());
        body.put("error", HttpStatus.UNAUTHORIZED.getReasonPhrase());
        body.put("errorCode", errorCode);
        body.put("message", message);

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}

