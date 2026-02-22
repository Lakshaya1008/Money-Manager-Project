package in.bushansirgur.moneymanager.service;

import in.bushansirgur.moneymanager.dto.AuthDTO;
import in.bushansirgur.moneymanager.dto.ProfileDTO;
import in.bushansirgur.moneymanager.entity.ProfileEntity;
import in.bushansirgur.moneymanager.exception.DuplicateResourceException;
import in.bushansirgur.moneymanager.exception.ResourceNotFoundException;
import in.bushansirgur.moneymanager.exception.ValidationException;
import in.bushansirgur.moneymanager.repository.ProfileRepository;
import in.bushansirgur.moneymanager.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Value("${app.activation.url}")
    private String activationURL;

    public ProfileDTO registerProfile(ProfileDTO profileDTO) {
        if (profileDTO.getEmail() == null || profileDTO.getEmail().trim().isEmpty()) {
            throw new ValidationException("email", "Email is required");
        }
        if (!isValidEmail(profileDTO.getEmail())) {
            throw new ValidationException("email", "Invalid email format. Please provide a valid email address.");
        }
        // Normalize email to lowercase before saving
        String normalizedEmail = profileDTO.getEmail().toLowerCase().trim();
        if (profileRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new DuplicateResourceException("An account with email '" + normalizedEmail + "' already exists. Please login instead or use a different email.");
        }
        if (profileDTO.getFullName() == null || profileDTO.getFullName().trim().isEmpty()) {
            throw new ValidationException("fullName", "Full name is required");
        }
        if (profileDTO.getPassword() == null || profileDTO.getPassword().isEmpty()) {
            throw new ValidationException("password", "Password is required");
        }
        if (profileDTO.getPassword().length() < 6) {
            throw new ValidationException("password", "Password must be at least 6 characters long");
        }
        profileDTO.setEmail(normalizedEmail);
        ProfileEntity newProfile = toEntity(profileDTO);
        newProfile.setActivationToken(UUID.randomUUID().toString());
        newProfile = profileRepository.save(newProfile);

        String activationLink = activationURL + "/activate?token=" + newProfile.getActivationToken();
        String subject = "Activate your Money Manager account";
        String body = "Click on the following link to activate your account: " + activationLink;
        emailService.sendEmail(newProfile.getEmail(), subject, body);

        return toDTO(newProfile);
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    public ProfileEntity toEntity(ProfileDTO profileDTO) {
        return ProfileEntity.builder()
                .id(profileDTO.getId())
                .fullName(profileDTO.getFullName())
                .email(profileDTO.getEmail())
                .password(passwordEncoder.encode(profileDTO.getPassword()))
                .profileImageUrl(profileDTO.getProfileImageUrl())
                .createdAt(profileDTO.getCreatedAt())
                .updatedAt(profileDTO.getUpdatedAt())
                .build();
    }

    public ProfileDTO toDTO(ProfileEntity profileEntity) {
        return ProfileDTO.builder()
                .id(profileEntity.getId())
                .fullName(profileEntity.getFullName())
                .email(profileEntity.getEmail())
                .profileImageUrl(profileEntity.getProfileImageUrl())
                .createdAt(profileEntity.getCreatedAt())
                .updatedAt(profileEntity.getUpdatedAt())
                .build();
    }

    public boolean activateProfile(String activationToken) {
        return profileRepository.findByActivationToken(activationToken)
                .map(profile -> {
                    profile.setIsActive(true);
                    profile.setActivationToken(null); // clear token after use
                    profileRepository.save(profile);
                    return true;
                })
                .orElse(false);
    }

    public boolean isAccountActive(String email) {
        return profileRepository.findByEmail(email)
                .map(ProfileEntity::getIsActive)
                .orElse(false);
    }

    public boolean emailExists(String email) {
        return profileRepository.findByEmail(email).isPresent();
    }

    public ProfileEntity getCurrentProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return profileRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Profile not found with email: " + authentication.getName()));
    }

    public ProfileDTO getPublicProfile(String email) {
        ProfileEntity currentUser;
        if (email == null) {
            currentUser = getCurrentProfile();
        } else {
            currentUser = profileRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Profile not found with email: " + email));
        }
        return ProfileDTO.builder()
                .id(currentUser.getId())
                .fullName(currentUser.getFullName())
                .email(currentUser.getEmail())
                .profileImageUrl(currentUser.getProfileImageUrl())
                .createdAt(currentUser.getCreatedAt())
                .updatedAt(currentUser.getUpdatedAt())
                .build();
    }

    public ProfileDTO updateProfile(ProfileDTO profileDTO) {
        ProfileEntity currentProfile = getCurrentProfile();
        if (profileDTO.getFullName() != null && !profileDTO.getFullName().trim().isEmpty()) {
            currentProfile.setFullName(profileDTO.getFullName().trim());
        }
        if (profileDTO.getProfileImageUrl() != null) {
            currentProfile.setProfileImageUrl(profileDTO.getProfileImageUrl());
        }
        currentProfile = profileRepository.save(currentProfile);
        return toDTO(currentProfile);
    }

    // ── NEW: Update full name only ────────────────────────────────────
    public ProfileDTO updateName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new ValidationException("fullName", "Full name cannot be empty");
        }
        ProfileEntity currentProfile = getCurrentProfile();
        currentProfile.setFullName(fullName.trim());
        currentProfile = profileRepository.save(currentProfile);
        return toDTO(currentProfile);
    }

    // ── NEW: Change password ──────────────────────────────────────────
    public void changePassword(String oldPassword, String newPassword) {
        if (oldPassword == null || oldPassword.trim().isEmpty()) {
            throw new ValidationException("oldPassword", "Current password is required");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new ValidationException("newPassword", "New password must be at least 6 characters");
        }
        ProfileEntity currentProfile = getCurrentProfile();
        // Verify old password matches
        if (!passwordEncoder.matches(oldPassword, currentProfile.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        currentProfile.setPassword(passwordEncoder.encode(newPassword));
        profileRepository.save(currentProfile);
    }

    public Map<String, Object> authenticateAndGenerateToken(AuthDTO authDTO) {
        if (authDTO.getEmail() == null || authDTO.getEmail().trim().isEmpty()) {
            throw new ValidationException("email", "Email is required");
        }
        if (authDTO.getPassword() == null || authDTO.getPassword().trim().isEmpty()) {
            throw new ValidationException("password", "Password is required");
        }
        String normalizedEmail = authDTO.getEmail().toLowerCase().trim();
        if (!emailExists(normalizedEmail)) {
            throw new ResourceNotFoundException("No account found with email '" + normalizedEmail + "'. Please register first.");
        }
        if (!isAccountActive(normalizedEmail)) {
            throw new ValidationException("account", "Account is not activated. Please check your email and activate your account first.");
        }
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, authDTO.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Incorrect password. Please try again.");
        }
        ProfileEntity profile = profileRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        String token = jwtUtil.generateToken(normalizedEmail);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("id", profile.getId());
        response.put("fullName", profile.getFullName());
        response.put("email", profile.getEmail());
        response.put("profileImageUrl", profile.getProfileImageUrl());
        response.put("createdAt", profile.getCreatedAt());
        response.put("updatedAt", profile.getUpdatedAt());
        return response;
    }
}