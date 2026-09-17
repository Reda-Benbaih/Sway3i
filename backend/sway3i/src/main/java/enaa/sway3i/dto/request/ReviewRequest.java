package enaa.sway3i.dto.request;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Data;
@Data
public class ReviewRequest {
    @NotNull(message = "Rating is required")
    @Min(1)
    @Max(5)
    private Integer rating;
    private String comment;
    @NotNull(message = "Enrollment ID is required")
    private Long enrollmentId;
}
