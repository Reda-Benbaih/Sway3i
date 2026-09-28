package enaa.sway3i.dto.request;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import enaa.sway3i.model.EnrollmentStatus;
@Data
public class EnrollmentStatusRequest {
    @NotNull(message = "Status is required")
    private EnrollmentStatus status;
    private String rejectionReason;
}
