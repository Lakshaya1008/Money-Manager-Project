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

    public ProfileDTO registerProfile(ProfileDTO profileDTO) {
        // Validate email
        if (profileDTO.getEmail() == null || profileDTO.getEmail().trim().isEmpty()) {
            throw new ValidationException("email", "Email is required");
        }
        if (!isValidEmail(profileDTO.getEmail())) {
            throw new ValidationException("email", "Invalid email format. Please provide a valid email address.");
        }

        // Check if email already exists
        if (profileRepository.findByEmail(profileDTO.getEmail()).isPresent()) {
            throw new DuplicateResourceException("An account with email '" + profileDTO.getEmail() + "' already exists. Please login instead or use a different email.");
        }

        // Validate full name
        if (profileDTO.getFullName() == null || profileDTO.getFullName().trim().isEmpty()) {
            throw new ValidationException("fullName", "Full name is required");
        }

        // Validate password
        if (profileDTO.getPassword() == null || profileDTO.getPassword().isEmpty()) {
            throw new ValidationException("password", "Password is required");
        }
        if (profileDTO.getPassword().length() < 6) {
            throw new ValidationException("password", "Password must be at least 6 characters long");
        }

        ProfileEntity newProfile = toEntity(profileDTO);
        newProfile.setActivationToken(UUID.randomUUID().toString());
        newProfile = profileRepository.save(newProfile);
        //send activation email
        String activationLink = activationURL+"/api/v1.0/activate?token=" + newProfile.getActivationToken();
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
        ProfileEntity currentUser = null;
        if (email == null) {
            currentUser = getCurrentProfile();
        }else {
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

    public Map<String, Object> authenticateAndGenerateToken(AuthDTO authDTO) {
        // Validate input
        if (authDTO.getEmail() == null || authDTO.getEmail().trim().isEmpty()) {
            throw new ValidationException("email", "Email is required");
        }
        if (authDTO.getPassword() == null || authDTO.getPassword().isEmpty()) {
            throw new ValidationException("password", "Password is required");
        }

        // Check if user exists first
        ProfileEntity profile = profileRepository.findByEmail(authDTO.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email '" + authDTO.getEmail() + "'. Please register first."));

        // Check if account is activated
        if (!profile.getIsActive()) {
            throw new in.bushansirgur.moneymanager.exception.AuthenticationException(
                "Account is not activated. Please check your email for the activation link and activate your account before logging in.");
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authDTO.getEmail(), authDTO.getPassword()));
            //Generate JWT token
            String token = jwtUtil.generateToken(authDTO.getEmail());
            return Map.of(
                    "token", token,
                    "user", getPublicProfile(authDTO.getEmail())
            );
        } catch (org.springframework.security.authentication.DisabledException e) {
            throw new in.bushansirgur.moneymanager.exception.AuthenticationException(
                "Account is not activated. Please check your email for the activation link.");
        } catch (org.springframework.security.authentication.LockedException e) {
            throw new in.bushansirgur.moneymanager.exception.AuthenticationException(
                "Account is locked. Please contact support for assistance.");
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            throw new in.bushansirgur.moneymanager.exception.AuthenticationException(
                "Invalid password. Please check your password and try again.");
        } catch (Exception e) {
            throw new in.bushansirgur.moneymanager.exception.AuthenticationException(
                "Authentication failed: " + e.getMessage());
        }
    }
}
