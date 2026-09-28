package enaa.sway3i.security;

import enaa.sway3i.model.Role;
import enaa.sway3i.model.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserService {

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails details)) {
            throw new AccessDeniedException("You must be logged in");
        }
        return details.getUser();
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

    // passes when the current user is the owner of the resource or an admin
    public void checkOwnerOrAdmin(Long ownerId) {
        if (!isAdmin() && !getCurrentUserId().equals(ownerId)) {
            throw new AccessDeniedException("You do not have permission to access this resource");
        }
    }
}
