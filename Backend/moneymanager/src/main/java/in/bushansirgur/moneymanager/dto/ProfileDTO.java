package in.bushansirgur.moneymanager.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProfileDTO {

    private Long id;
    private String fullName;
    private String email;

    // Fixed: @JsonIgnore prevents this field from ever appearing in API responses.
    // toDTO() in ProfileService never sets it, but having it serializable at all
    // is a security risk — if it ever gets accidentally set the hash leaks to clients.
    @JsonIgnore
    private String password;

    private String profileImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}