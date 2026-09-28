package enaa.sway3i.service;

import enaa.sway3i.dto.request.ReviewRequest;
import enaa.sway3i.dto.response.ReviewResponse;
import enaa.sway3i.exception.BadRequestException;
import enaa.sway3i.exception.ConflictException;
import enaa.sway3i.mapper.ReviewMapper;
import enaa.sway3i.model.CourseListing;
import enaa.sway3i.model.Enrollment;
import enaa.sway3i.model.EnrollmentStatus;
import enaa.sway3i.model.Review;
import enaa.sway3i.model.Student;
import enaa.sway3i.model.Tutor;
import enaa.sway3i.repository.EnrollmentRepository;
import enaa.sway3i.repository.ReviewRepository;
import enaa.sway3i.security.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private ReviewMapper reviewMapper;

    @Mock
    private TutorService tutorService;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private ReviewService reviewService;

    private Enrollment enrollment;
    private ReviewRequest request;

    @BeforeEach
    void setUp() {
        Student student = new Student();
        student.setId(1L);

        Tutor tutor = new Tutor();
        tutor.setId(2L);

        CourseListing courseListing = new CourseListing();
        courseListing.setId(3L);
        courseListing.setTutor(tutor);

        enrollment = new Enrollment();
        enrollment.setId(10L);
        enrollment.setStudent(student);
        enrollment.setCourseListing(courseListing);
        enrollment.setStatus(EnrollmentStatus.COMPLETED);

        request = new ReviewRequest();
        request.setEnrollmentId(10L);
        request.setRating(5);
        request.setComment("Great teacher");
    }

    @Test
    void createReview_onCompletedCourse_updatesTutorRating() {
        Review review = new Review();
        when(enrollmentRepository.findById(10L)).thenReturn(Optional.of(enrollment));
        when(reviewMapper.toEntity(request)).thenReturn(review);
        when(reviewRepository.save(review)).thenReturn(review);
        when(reviewMapper.toResponse(review)).thenReturn(new ReviewResponse());

        reviewService.createReview(request);

        assertEquals(enrollment, review.getEnrollment());
        assertNotNull(review.getPublishedAt());
        verify(currentUserService).checkOwnerOrAdmin(1L);
        verify(tutorService).refreshAverageRating(2L);
    }

    @Test
    void createReview_beforeCourseIsCompleted_isRejected() {
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        when(enrollmentRepository.findById(10L)).thenReturn(Optional.of(enrollment));

        assertThrows(BadRequestException.class, () -> reviewService.createReview(request));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void createReview_twice_isRejected() {
        when(enrollmentRepository.findById(10L)).thenReturn(Optional.of(enrollment));
        when(reviewRepository.existsByEnrollmentId(10L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> reviewService.createReview(request));
    }

    @Test
    void createReview_forSomeoneElsesEnrollment_isForbidden() {
        when(enrollmentRepository.findById(10L)).thenReturn(Optional.of(enrollment));
        doThrow(new AccessDeniedException("no")).when(currentUserService).checkOwnerOrAdmin(1L);

        assertThrows(AccessDeniedException.class, () -> reviewService.createReview(request));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void deleteReview_refreshesTutorRating() {
        Review review = new Review();
        review.setId(20L);
        review.setEnrollment(enrollment);
        when(reviewRepository.findById(20L)).thenReturn(Optional.of(review));

        reviewService.deleteReview(20L);

        verify(reviewRepository).delete(review);
        verify(tutorService).refreshAverageRating(2L);
    }
}
