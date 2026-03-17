package in.bushansirgur.moneymanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthDTO {
    private String email;
    private String password;
    // REMOVED: token field — AuthDTO is only used for login requests (email + password).
    // The token field was never set, never read, never returned. Its presence
    // confused the login flow — anyone reading the code would wonder what it's for.
}