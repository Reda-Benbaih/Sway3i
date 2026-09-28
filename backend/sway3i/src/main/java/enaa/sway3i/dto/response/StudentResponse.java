package enaa.sway3i.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import enaa.sway3i.model.Level;
import enaa.sway3i.model.Role;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String city;
    private Role role;
    private LocalDateTime createdAt;
    private Level level;
    private String school;
    private String preferences;
}
