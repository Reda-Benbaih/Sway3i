package enaa.sway3i.dto.request;

import enaa.sway3i.model.SessionStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SessionRequest {
    @NotNull(message = "Date is required")
    private LocalDate date;
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    @NotNull(message = "Course listing ID is required")
    private Long courseListingId;
    private SessionStatus status;

    @AssertTrue(message = "End time must be after start time")
    public boolean isTimeRangeValid() {
        return startTime == null || endTime == null || endTime.isAfter(startTime);
    }
}
