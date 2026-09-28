package enaa.sway3i.mapper;

import enaa.sway3i.model.User;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

@Component
public class UserNameMapper {

    @Named("fullName")
    public String fullName(User user) {
        if (user == null) {
            return null;
        }
        String first = user.getFirstName() == null ? "" : user.getFirstName();
        String last = user.getLastName() == null ? "" : user.getLastName();
        return (first + " " + last).trim();
    }
}
