package enaa.sway3i.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class WeeklySlotRequest {
    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    @NotNull(message = "Course listing ID is required")
    private Long courseListingId;

    @AssertTrue(message = "End time must be after start time")
    public boolean isTimeRangeValid() {
        return startTime == null || endTime == null || endTime.isAfter(startTime);
    }
}
