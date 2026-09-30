package enaa.sway3i.dto.request;

import enaa.sway3i.model.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotBlank(message = "Token is required")
    private String token;

    private Role role;
}
