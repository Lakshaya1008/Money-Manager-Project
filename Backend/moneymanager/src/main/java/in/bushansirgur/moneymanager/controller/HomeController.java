package in.bushansirgur.moneymanager.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping({"/status", "/health"})
public class HomeController {

    @Value("${spring.application.name:moneymanager}")
    private String appName;

    // FIXED: was returning plain String ("Application is running") with Content-Type: text/plain.
    // Every other endpoint returns JSON. backendWakeUp.js calls /health — if anything
    // ever parsed the response as JSON it would fail silently.
    // Now returns a consistent JSON object matching the pattern of all other endpoints.
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("app", appName);
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}