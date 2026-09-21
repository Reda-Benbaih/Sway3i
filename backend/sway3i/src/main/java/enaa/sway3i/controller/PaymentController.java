package enaa.sway3i.controller;

import enaa.sway3i.dto.request.PaymentRequest;
import enaa.sway3i.dto.response.PaymentResponse;
import enaa.sway3i.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<Page<PaymentResponse>> getAllPayments(Pageable pageable) {
        return ResponseEntity.ok(paymentService.getAllPayments(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request) {
        return new ResponseEntity<>(paymentService.createPayment(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponse> updatePayment(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.updatePayment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
