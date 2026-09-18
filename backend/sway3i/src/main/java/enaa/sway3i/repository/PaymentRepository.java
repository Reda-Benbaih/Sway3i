package enaa.sway3i.repository;

import enaa.sway3i.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByEnrollmentId(Long enrollmentId);
}