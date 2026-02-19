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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    // ─── Registration ─────────────────────────────────────────────────────────

    public ProfileDTO registerProfile(ProfileDTO profileDTO) {
        // FIX: Normalize email to lowercase before any validation or storage.
        // Prevents case-mismatch login issues (e.g. register "John@Gmail.com",
        // can't login with "john@gmail.com")
        if (profileDTO.getEmail() != null) {
            profileDTO.setEmail(profileDTO.getEmail().toLowerCase().trim());
        }

        if (profileDTO.getEmail() == null || profileDTO.getEmail().isEmpty())
            throw new ValidationException("email", "Email is required");
        if (!isValidEmail(profileDTO.getEmail()))
            throw new ValidationException("email",
                    "Invalid email format. Please provide a valid email address.");
        if (profileRepository.findByEmail(profileDTO.getEmail()).isPresent())
            throw new DuplicateResourceException(
                    "An account with email '" + profileDTO.getEmail()
                            + "' already exists. Please login instead or use a different email.");
        if (profileDTO.getFullName() == null || profileDTO.getFullName().trim().isEmpty())
            throw new ValidationException("fullName", "Full name is required");
        if (profileDTO.getPassword() == null || profileDTO.getPassword().isEmpty())
            throw new ValidationException("password", "Password is required");
        if (profileDTO.getPassword().length() < 6)
            throw new ValidationException("password",
                    "Password must be at least 6 characters long");

        ProfileEntity newProfile = toEntity(profileDTO);
        newProfile.setActivationToken(UUID.randomUUID().toString());
        newProfile = profileRepository.save(newProfile);

        String activationLink = activationURL + "/activate?token=" + newProfile.getActivationToken();
        String subject = "Activate your Money Manager account";
        String body = "<p>Hi " + newProfile.getFullName() + ",</p>"
                + "<p>Click the link below to activate your account:</p>"
                + "<p><a href=\"" + activationLink + "\" style=\""
                + "display:inline-block;padding:10px 20px;background-color:#7c3aed;"
                + "color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;"
                + "\">Activate Account</a></p>"
                + "<p style=\"color:#888;font-size:12px;\">If you did not create this account, please ignore this email.</p>";
        emailService.sendEmail(newProfile.getEmail(), subject, body);
        return toDTO(newProfile);
    }

    // ─── Activation ───────────────────────────────────────────────────────────

    /**
     * FIX: Clears the activation token after use so it cannot be reused.
     */
    public boolean activateProfile(String activationToken) {
        return profileRepository.findByActivationToken(activationToken)
                .map(profile -> {
                    profile.setIsActive(true);
                    profile.setActivationToken(null); // security: one-time use
                    profileRepository.save(profile);
                    return true;
                })
                .orElse(false);
    }

    // ─── Authentication ───────────────────────────────────────────────────────

    public Map<String, Object> authenticateAndGenerateToken(AuthDTO authDTO) {
        if (authDTO.getEmail() == null || authDTO.getEmail().trim().isEmpty())
            throw new ValidationException("email", "Email is required");
        if (authDTO.getPassword() == null || authDTO.getPassword().isEmpty())
            throw new ValidationException("password", "Password is required");

        // FIX: Normalize email before lookup — matches what registration stores
        String email = authDTO.getEmail().toLowerCase().trim();

        ProfileEntity profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No account found with email '" + email + "'. Please register first."));

        if (!Boolean.TRUE.equals(profile.getIsActive()))
            throw new in.bushansirgur.moneymanager.exception.AuthenticationException(
                    "Account is not activated. Please check your email for the activation "
                            + "link and activate your account before logging in.");

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, authDTO.getPassword()));
            String token = jwtUtil.generateToken(email);
            return Map.of("token", token, "user", getPublicProfile(email));

        } catch (org.springframework.security.authentication.DisabledException e) {
            throw new in.bushansirgur.moneymanager.exception.AuthenticationException(
                    "Account is not activated. Please check your email for the activation link.");
        } catch (org.springframework.security.authentication.LockedException e) {
            throw new in.bushansirgur.moneymanager.exception.AuthenticationException(
                    "Account is locked. Please contact support for assistance.");
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            throw new in.bushansirgur.moneymanager.exception.AuthenticationException(
                    "Invalid password. Please check your password and try again.");
        }
    }

    // ─── Profile Update ───────────────────────────────────────────────────────

    /**
     * Update currently authenticated user's profile.
     * Only fullName and profileImageUrl can be changed.
     */
    public ProfileDTO updateProfile(ProfileDTO profileDTO) {
        ProfileEntity current = getCurrentProfile();

        if (profileDTO.getFullName() != null) {
            if (profileDTO.getFullName().trim().isEmpty())
                throw new ValidationException("fullName", "Full name cannot be empty");
            current.setFullName(profileDTO.getFullName().trim());
        }

        if (profileDTO.getProfileImageUrl() != null) {
            String url = profileDTO.getProfileImageUrl().trim();
            current.setProfileImageUrl(url.isEmpty() ? null : url);
        }

        current = profileRepository.save(current);
        return toDTO(current);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public ProfileEntity getCurrentProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return profileRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Profile not found with email: " + auth.getName()));
    }

    public ProfileDTO getPublicProfile(String email) {
        ProfileEntity user = (email == null)
                ? getCurrentProfile()
                : profileRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Profile not found with email: " + email));
        return toDTO(user);
    }

    public boolean isAccountActive(String email) {
        return profileRepository.findByEmail(email.toLowerCase().trim())
                .map(ProfileEntity::getIsActive)
                .orElse(false);
    }

    public boolean emailExists(String email) {
        return profileRepository.findByEmail(email.toLowerCase().trim()).isPresent();
    }

    public ProfileEntity toEntity(ProfileDTO dto) {
        return ProfileEntity.builder()
                .id(dto.getId())
                .fullName(dto.getFullName() != null ? dto.getFullName().trim() : null)
                .email(dto.getEmail()) // already normalized before calling toEntity
                .password(passwordEncoder.encode(dto.getPassword()))
                .profileImageUrl(dto.getProfileImageUrl())
                .build();
    }

    public ProfileDTO toDTO(ProfileEntity entity) {
        return ProfileDTO.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .email(entity.getEmail())
                .profileImageUrl(entity.getProfileImageUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private boolean isValidEmail(String email) {
        return email != null
                && email.matches("^[a-z0-9+_.-]+@[a-z0-9.-]+\\.[a-z]{2,}$");
    }
}