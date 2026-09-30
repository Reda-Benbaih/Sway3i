package enaa.sway3i.service;

import enaa.sway3i.dto.request.ReviewRequest;
import enaa.sway3i.dto.response.ReviewResponse;
import enaa.sway3i.exception.BadRequestException;
import enaa.sway3i.exception.ConflictException;
import enaa.sway3i.exception.ResourceNotFoundException;
import enaa.sway3i.mapper.ReviewMapper;
import enaa.sway3i.model.Enrollment;
import enaa.sway3i.model.EnrollmentStatus;
import enaa.sway3i.model.Review;
import enaa.sway3i.repository.EnrollmentRepository;
import enaa.sway3i.repository.ReviewRepository;
import enaa.sway3i.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReviewMapper reviewMapper;
    private final TutorService tutorService;
    private final CurrentUserService currentUserService;

    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        Page<Review> reviews = reviewRepository.findAll(pageable);
        return reviews.map(reviewMapper::toResponse);
    }

    public List<ReviewResponse> getReviewsByTutor(Long tutorId) {
        return reviewMapper.toResponseList(reviewRepository.findByEnrollment_CourseListing_Tutor_Id(tutorId));
    }

    public ReviewResponse getReviewByEnrollment(Long enrollmentId) {
        return reviewRepository.findByEnrollmentId(enrollmentId).stream()
                .findFirst()
                .map(reviewMapper::toResponse)
                .orElse(null);
    }

    public ReviewResponse getReviewById(Long id) {
        return reviewMapper.toResponse(findReview(id));
    }

    public ReviewResponse createReview(ReviewRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("enrollment with this " + request.getEnrollmentId() + " does not exist"));

        currentUserService.checkOwnerOrAdmin(enrollment.getStudent().getId());

        if (enrollment.getStatus() != EnrollmentStatus.COMPLETED) {
            throw new BadRequestException("You can only review a course after it is completed");
        }
        if (reviewRepository.existsByEnrollmentId(enrollment.getId())) {
            throw new ConflictException("You already reviewed this course");
        }

        Review review = reviewMapper.toEntity(request);
        review.setEnrollment(enrollment);
        review.setPublishedAt(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);
        tutorService.refreshAverageRating(tutorIdOf(enrollment));
        return reviewMapper.toResponse(savedReview);
    }

    public ReviewResponse updateReview(Long id, ReviewRequest request) {
        Review existingReview = findReview(id);
        currentUserService.checkOwnerOrAdmin(existingReview.getEnrollment().getStudent().getId());

        existingReview.setRating(request.getRating());
        existingReview.setComment(request.getComment());

        Review updatedReview = reviewRepository.save(existingReview);
        tutorService.refreshAverageRating(tutorIdOf(existingReview.getEnrollment()));
        return reviewMapper.toResponse(updatedReview);
    }

    public void deleteReview(Long id) {
        Review review = findReview(id);
        currentUserService.checkOwnerOrAdmin(review.getEnrollment().getStudent().getId());

        Long tutorId = tutorIdOf(review.getEnrollment());
        reviewRepository.delete(review);
        tutorService.refreshAverageRating(tutorId);
    }

    private Long tutorIdOf(Enrollment enrollment) {
        return enrollment.getCourseListing().getTutor().getId();
    }

    private Review findReview(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("review with this " + id + " does not exist"));
    }
}
