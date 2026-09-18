package enaa.sway3i.mapper;

import enaa.sway3i.dto.request.PaymentRequest;
import enaa.sway3i.dto.response.PaymentResponse;
import enaa.sway3i.model.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paidAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "enrollment", ignore = true)
    Payment toEntity(PaymentRequest request);

    @Mapping(target = "enrollmentId", source = "enrollment.id")
    PaymentResponse toResponse(Payment entity);

    List<PaymentResponse> toResponseList(List<Payment> entities);
}
