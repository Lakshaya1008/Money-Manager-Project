package in.bushansirgur.moneymanager.controller;

import in.bushansirgur.moneymanager.dto.AuthDTO;
import in.bushansirgur.moneymanager.dto.ProfileDTO;
import in.bushansirgur.moneymanager.exception.ResourceNotFoundException;
import in.bushansirgur.moneymanager.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1.0")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping("/register")
    public ResponseEntity<ProfileDTO> registerProfile(@RequestBody ProfileDTO profileDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.registerProfile(profileDTO));
    }

    @GetMapping("/activate")
    public ResponseEntity<Map<String, Object>> activateProfile(@RequestParam String token) {
        boolean isActivated = profileService.activateProfile(token);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        if (isActivated) {
            response.put("status", HttpStatus.OK.value());
            response.put("message", "Profile activated successfully. You can now login to your account.");
            return ResponseEntity.ok(response);
        } else {
            throw new ResourceNotFoundException("Activation token not found or already used.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthDTO authDTO) {
        return ResponseEntity.ok(profileService.authenticateAndGenerateToken(authDTO));
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDTO> getPublicProfile() {
        return ResponseEntity.ok(profileService.getPublicProfile(null));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDTO> updateProfile(@RequestBody ProfileDTO profileDTO) {
        return ResponseEntity.ok(profileService.updateProfile(profileDTO));
    }

    @PutMapping("/profile/update-name")
    public ResponseEntity<ProfileDTO> updateName(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(profileService.updateName(body.get("fullName")));
    }

    @PutMapping("/profile/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> body) {
        profileService.changePassword(body.get("oldPassword"), body.get("newPassword"));
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    // ── NEW: Forgot password — sends reset link email ─────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> body) {
        profileService.forgotPassword(body.get("email"));
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        // Always return success — prevents email enumeration (don't reveal if email exists)
        response.put("message", "If an account with that email exists, a reset link has been sent.");
        return ResponseEntity.ok(response);
    }

    // ── NEW: Reset password — verifies token and sets new password ─────
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> body) {
        profileService.resetPassword(body.get("token"), body.get("newPassword"));
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("message", "Password reset successfully. You can now login with your new password.");
        return ResponseEntity.ok(response);
    }
}