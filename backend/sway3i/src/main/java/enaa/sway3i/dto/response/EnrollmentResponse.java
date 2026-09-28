package enaa.sway3i.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import enaa.sway3i.model.EnrollmentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {

    private Long id;
    private LocalDateTime requestedAt;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyPrice;
    private EnrollmentStatus status;
    private String rejectionReason;
    private Long studentId;
    private String studentName;
    private Long courseListingId;
    private String courseTitle;
    private Long weeklySlotId;
    private Long tutorId;
    private String tutorName;
}
