package in.bushansirgur.moneymanager.repository;

import in.bushansirgur.moneymanager.entity.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfileRepository extends JpaRepository<ProfileEntity, Long> {
    Optional<ProfileEntity> findByEmail(String email);
    Optional<ProfileEntity> findByActivationToken(String activationToken);
    Optional<ProfileEntity> findByResetPasswordToken(String resetPasswordToken);

    // Fixed: added for NotificationService — previously it used findAll() which
    // returned every account including unactivated ones, spamming users who
    // registered but never confirmed their email.
    List<ProfileEntity> findByIsActiveTrue();
}