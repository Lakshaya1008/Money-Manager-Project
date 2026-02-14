package in.bushansirgur.moneymanager.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.bushansirgur.moneymanager.util.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SecurityException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {

    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        String email = null;
        String jwt = null;

        // Skip JWT validation for public endpoints
        String requestPath = request.getRequestURI();
        if (isPublicEndpoint(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);

                // Check if token is empty or just whitespace
                if (jwt.trim().isEmpty()) {
                    sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT token is empty", "AUTH_TOKEN_MISSING");
                    return;
                }

                email = jwtUtil.extractUsername(jwt);
            } else if (authHeader != null && !authHeader.startsWith("Bearer ")) {
                sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid Authorization header format. Expected 'Bearer <token>'", "AUTH_TOKEN_INVALID");
                return;
            }

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT token validation failed. Token may be expired or invalid.", "AUTH_TOKEN_INVALID");
                    return;
                }
            }

            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException e) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Authentication token has expired. Please login again to get a new token.", "AUTH_TOKEN_EXPIRED");
        } catch (MalformedJwtException e) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT token is malformed. Please provide a valid token.", "AUTH_TOKEN_INVALID");
        } catch (SecurityException e) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT token signature is invalid. Token may have been tampered with.", "AUTH_TOKEN_INVALID");
        } catch (UnsupportedJwtException e) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT token format is not supported.", "AUTH_TOKEN_INVALID");
        } catch (IllegalArgumentException e) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT token is invalid: " + e.getMessage(), "AUTH_TOKEN_INVALID");
        } catch (UsernameNotFoundException e) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "User not found for the provided token. Account may have been deleted.", "AUTH_TOKEN_INVALID");
        }
    }

    /**
     * Check if the request path is a public endpoint that doesn't require authentication
     */
    private boolean isPublicEndpoint(String requestPath) {
        // Remove context path if present
        String path = requestPath.replace("/api/v1.0", "");
        return path.equals("/status") ||
               path.equals("/health") ||
               path.equals("/register") ||
               path.startsWith("/activate") ||
               path.equals("/login");
    }

    /**
     * Send a JSON error response with proper formatting
     */
    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message, String errorCode) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("errorCode", errorCode);
        body.put("message", message);

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
