package enaa.sway3i.dto.request;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
@Data
public class EnrollmentRequest {
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    @NotNull(message = "Course listing ID is required")
    private Long courseListingId;
    @NotNull(message = "Student ID is required")
    private Long studentId;
}
