package enaa.sway3i.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class SubjectRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String description;
}
