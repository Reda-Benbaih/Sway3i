package enaa.sway3i.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;
    @Size(max = 255, message = "Comment must not exceed 255 characters")
    private String comment;
    @NotNull(message = "Enrollment ID is required")
    private Long enrollmentId;
}
