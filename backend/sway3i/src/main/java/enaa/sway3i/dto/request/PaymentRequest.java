package enaa.sway3i.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import enaa.sway3i.model.PaymentMethod;
import java.math.BigDecimal;
@Data
public class PaymentRequest {
    @NotNull(message = "Amount is required")
    private BigDecimal amount;
    @NotBlank(message = "Billing month is required")
    private String billingMonth;
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
    @NotNull(message = "Enrollment ID is required")
    private Long enrollmentId;
}
