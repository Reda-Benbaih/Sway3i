package enaa.sway3i.service;

import enaa.sway3i.exception.ResourceNotFoundException;
import enaa.sway3i.dto.request.PaymentRequest;
import enaa.sway3i.dto.response.PaymentResponse;
import enaa.sway3i.mapper.PaymentMapper;
import enaa.sway3i.model.Enrollment;
import enaa.sway3i.model.Payment;
import enaa.sway3i.model.PaymentStatus;
import enaa.sway3i.repository.EnrollmentRepository;
import enaa.sway3i.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentMapper paymentMapper;

    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        Page<Payment> payments = paymentRepository.findAll(pageable);
        return payments.map(paymentMapper::toResponse);
    }

    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("payment with this " + id + " does not exist"));
        return paymentMapper.toResponse(payment);
    }

    public PaymentResponse createPayment(PaymentRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("enrollment with this " + request.getEnrollmentId() + " does not exist"));

        Payment payment = paymentMapper.toEntity(request);
        payment.setEnrollment(enrollment);
        payment.setReference(UUID.randomUUID().toString());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);
        return paymentMapper.toResponse(savedPayment);
    }

    public PaymentResponse updatePayment(Long id, PaymentRequest request) {
        Payment existingPayment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("payment with this " + id + " does not exist"));

        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("enrollment with this " + request.getEnrollmentId() + " does not exist"));

        existingPayment.setAmount(request.getAmount());
        existingPayment.setBillingMonth(request.getBillingMonth());
        existingPayment.setPaymentMethod(request.getPaymentMethod());
        existingPayment.setEnrollment(enrollment);

        Payment updatedPayment = paymentRepository.save(existingPayment);
        return paymentMapper.toResponse(updatedPayment);
    }

    public void deletePayment(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResourceNotFoundException("payment with this " + id + " does not exist");
        }
        paymentRepository.deleteById(id);
    }
}
