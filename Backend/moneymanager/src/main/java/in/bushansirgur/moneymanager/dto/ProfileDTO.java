package in.bushansirgur.moneymanager.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    // WRITE_ONLY = accepted in incoming JSON (requests) but never included in outgoing JSON (responses).
    // @JsonIgnore was wrong here — it blocked deserialization too, so password always arrived as null
    // at the backend, causing "Password is required" even when the user had typed one.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String profileImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}