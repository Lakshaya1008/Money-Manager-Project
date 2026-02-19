package in.bushansirgur.moneymanager.service;

import in.bushansirgur.moneymanager.entity.ProfileEntity;
import in.bushansirgur.moneymanager.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final ProfileRepository profileRepository;

    /**
     * FIX: Normalize email to lowercase before lookup.
     *
     * Without this, a user who registers as "John@Gmail.com" cannot login
     * with "john@gmail.com" because findByEmail() is case-sensitive.
     *
     * Spring Security calls this during JWT filter validation — the username
     * extracted from the JWT is whatever was used at login time, so both
     * registration and login must normalize consistently.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Normalize email — critical for case-insensitive login
        String normalizedEmail = username != null ? username.toLowerCase().trim() : username;

        ProfileEntity profile = profileRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Profile not found with email: " + normalizedEmail));

        boolean isActive = Boolean.TRUE.equals(profile.getIsActive());

        return User.builder()
                .username(profile.getEmail())
                .password(profile.getPassword())
                .disabled(!isActive)          // locks out inactive accounts
                .accountLocked(false)
                .accountExpired(false)
                .credentialsExpired(false)
                .authorities(Collections.emptyList())
                .build();
    }
}