package enaa.sway3i.security;

import enaa.sway3i.model.Role;
import enaa.sway3i.model.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CurrentUserService {

    public User getCurrentUser() {
        return findCurrentUser().orElseThrow(() -> new AccessDeniedException("You must be logged in"));
    }

    public Optional<User> findCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails details)) {
            return Optional.empty();
        }
        return Optional.of(details.getUser());
    }

    public boolean isCurrentUserAdminOrSelf(Long userId) {
        return findCurrentUser()
                .map(user -> user.getRole() == Role.ADMIN || user.getId().equals(userId))
                .orElse(false);
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public boolean hasRole(Role role) {
        return getCurrentUser().getRole() == role;
    }

    public boolean isAdmin() {
        return hasRole(Role.ADMIN);
    }

    public void checkOwnerOrAdmin(Long ownerId) {
        if (!isAdmin() && !getCurrentUserId().equals(ownerId)) {
            throw new AccessDeniedException("You do not have permission to access this resource");
        }
    }
}
