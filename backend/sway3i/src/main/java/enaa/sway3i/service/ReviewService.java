package enaa.sway3i.service;

import enaa.sway3i.dto.request.ReviewRequest;
import enaa.sway3i.dto.response.ReviewResponse;
import enaa.sway3i.mapper.ReviewMapper;
import enaa.sway3i.model.Enrollment;
import enaa.sway3i.model.Review;
import enaa.sway3i.repository.EnrollmentRepository;
import enaa.sway3i.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReviewMapper reviewMapper;

    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        Page<Review> reviews = reviewRepository.findAll(pageable);
        return reviews.map(reviewMapper::toResponse);
    }

    public ReviewResponse getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("review with this " + id + " does not exist"));
        return reviewMapper.toResponse(review);
    }

    public ReviewResponse createReview(ReviewRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new RuntimeException("enrollment with this " + request.getEnrollmentId() + " does not exist"));

        Review review = reviewMapper.toEntity(request);
        review.setEnrollment(enrollment);
        review.setPublishedAt(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);
        return reviewMapper.toResponse(savedReview);
    }

    public ReviewResponse updateReview(Long id, ReviewRequest request) {
        Review existingReview = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("review with this " + id + " does not exist"));

        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new RuntimeException("enrollment with this " + request.getEnrollmentId() + " does not exist"));

        existingReview.setRating(request.getRating());
        existingReview.setComment(request.getComment());
        existingReview.setEnrollment(enrollment);

        Review updatedReview = reviewRepository.save(existingReview);
        return reviewMapper.toResponse(updatedReview);
    }

    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new RuntimeException("review with this " + id + " does not exist");
        }
        reviewRepository.deleteById(id);
    }
}
