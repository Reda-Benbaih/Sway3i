package enaa.sway3i.controller;

import enaa.sway3i.dto.request.ReviewRequest;
import enaa.sway3i.dto.response.ReviewResponse;
import enaa.sway3i.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getAllReviews(Pageable pageable) {
        return ResponseEntity.ok(reviewService.getAllReviews(pageable));
    }

    @GetMapping("/by-tutor/{tutorId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByTutor(@PathVariable Long tutorId) {
        return ResponseEntity.ok(reviewService.getReviewsByTutor(tutorId));
    }

    @GetMapping("/by-enrollment/{enrollmentId}")
    public ResponseEntity<ReviewResponse> getReviewByEnrollment(@PathVariable Long enrollmentId) {
        ReviewResponse response = reviewService.getReviewByEnrollment(enrollmentId);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewRequest request) {
        return new ResponseEntity<>(reviewService.createReview(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ReviewResponse> updateReview(@PathVariable Long id, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
