package enaa.sway3i.controller;

import enaa.sway3i.dto.response.CurrentUserResponse;
import enaa.sway3i.model.User;
import enaa.sway3i.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final CurrentUserService currentUserService;

    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> getCurrentUser() {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(new CurrentUserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name()
        ));
    }
}
