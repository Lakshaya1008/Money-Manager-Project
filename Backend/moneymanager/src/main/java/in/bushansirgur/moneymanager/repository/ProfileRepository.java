package in.bushansirgur.moneymanager.repository;

import in.bushansirgur.moneymanager.entity.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<ProfileEntity, Long> {
    Optional<ProfileEntity> findByEmail(String email);
    Optional<ProfileEntity> findByActivationToken(String activationToken);
    Optional<ProfileEntity> findByResetPasswordToken(String resetPasswordToken); // ← NEW
}