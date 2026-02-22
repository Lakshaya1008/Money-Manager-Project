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
        ProfileDTO registeredProfile = profileService.registerProfile(profileDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredProfile);
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
            throw new ResourceNotFoundException("Activation token not found or already used. Please request a new activation email.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthDTO authDTO) {
        Map<String, Object> response = profileService.authenticateAndGenerateToken(authDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDTO> getPublicProfile() {
        ProfileDTO profileDTO = profileService.getPublicProfile(null);
        return ResponseEntity.ok(profileDTO);
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDTO> updateProfile(@RequestBody ProfileDTO profileDTO) {
        ProfileDTO updatedProfile = profileService.updateProfile(profileDTO);
        return ResponseEntity.ok(updatedProfile);
    }

    // ── NEW: Update name only ─────────────────────────────────────────
    @PutMapping("/profile/update-name")
    public ResponseEntity<ProfileDTO> updateName(@RequestBody Map<String, String> body) {
        String fullName = body.get("fullName");
        ProfileDTO updatedProfile = profileService.updateName(fullName);
        return ResponseEntity.ok(updatedProfile);
    }

    // ── NEW: Change password ──────────────────────────────────────────
    @PutMapping("/profile/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> body) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        profileService.changePassword(oldPassword, newPassword);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }
}