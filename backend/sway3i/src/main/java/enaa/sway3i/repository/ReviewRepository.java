package enaa.sway3i.repository;

import enaa.sway3i.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByEnrollmentId(Long enrollmentId);
}