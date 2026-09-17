package enaa.sway3i.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import enaa.sway3i.model.PaymentMethod;
import enaa.sway3i.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private String reference;
    private BigDecimal amount;
    private String billingMonth;
    private LocalDateTime paidAt;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private Long enrollmentId;
}
