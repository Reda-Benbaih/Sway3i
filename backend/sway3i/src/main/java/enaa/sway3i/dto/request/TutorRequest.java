package enaa.sway3i.dto.request;

import enaa.sway3i.dto.validation.OnCreate;
import enaa.sway3i.dto.validation.ValidationPatterns;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TutorRequest {
    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;
    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    // required on create, optional on update (empty keeps the old password)
    @NotBlank(groups = OnCreate.class, message = "Password is required")
    @Pattern(regexp = ValidationPatterns.PASSWORD, message = ValidationPatterns.PASSWORD_MESSAGE)
    private String password;
    @Pattern(regexp = ValidationPatterns.PHONE, message = ValidationPatterns.PHONE_MESSAGE)
    private String phone;
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;
    @Size(max = 255, message = "Biography must not exceed 255 characters")
    private String biography;
    @Size(max = 255, message = "Degree must not exceed 255 characters")
    private String degree;
    private String nationalId;
    @PositiveOrZero(message = "Hourly rate must be positive")
    private BigDecimal hourlyRate;
    @Size(max = 255, message = "Teaching zones must not exceed 255 characters")
    private String teachingZones;
    private List<Long> subjectIds;
}
