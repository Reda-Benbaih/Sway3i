package enaa.sway3i.service;

import enaa.sway3i.dto.request.EnrollmentRequest;
import enaa.sway3i.dto.request.EnrollmentStatusRequest;
import enaa.sway3i.dto.response.EnrollmentResponse;
import enaa.sway3i.exception.BadRequestException;
import enaa.sway3i.exception.ConflictException;
import enaa.sway3i.mapper.EnrollmentMapper;
import enaa.sway3i.model.CourseListing;
import enaa.sway3i.model.CourseType;
import enaa.sway3i.model.Enrollment;
import enaa.sway3i.model.EnrollmentStatus;
import enaa.sway3i.model.Student;
import enaa.sway3i.model.Tutor;
import enaa.sway3i.model.WeeklySlot;
import enaa.sway3i.repository.CourseListingRepository;
import enaa.sway3i.repository.EnrollmentRepository;
import enaa.sway3i.repository.StudentRepository;
import enaa.sway3i.repository.WeeklySlotRepository;
import enaa.sway3i.security.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private CourseListingRepository courseListingRepository;

    @Mock
    private WeeklySlotRepository weeklySlotRepository;

    @Mock
    private EnrollmentMapper enrollmentMapper;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private EnrollmentService enrollmentService;

    private Student student;
    private Tutor tutor;
    private CourseListing courseListing;
    private EnrollmentRequest request;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(enrollmentService, "verifiedTutorsOnly", true);

        student = new Student();
        student.setId(1L);

        tutor = new Tutor();
        tutor.setId(2L);
        tutor.setIsVerified(true);

        courseListing = new CourseListing();
        courseListing.setId(3L);
        courseListing.setTutor(tutor);
        courseListing.setIsActive(true);
        courseListing.setCourseType(CourseType.GROUP);
        courseListing.setMaxCapacity(2);
        courseListing.setMonthlyPrice(BigDecimal.valueOf(400));

        request = new EnrollmentRequest();
        request.setCourseListingId(3L);
        request.setStartDate(LocalDate.now().plusDays(1));
        request.setEndDate(LocalDate.now().plusMonths(1));
    }

    private void loggedInAsStudent() {
        when(currentUserService.isAdmin()).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(1L);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(courseListingRepository.findById(3L)).thenReturn(Optional.of(courseListing));
    }

    private Enrollment enrollmentWithStatus(EnrollmentStatus status) {
        Enrollment enrollment = new Enrollment();
        enrollment.setId(10L);
        enrollment.setStudent(student);
        enrollment.setCourseListing(courseListing);
        enrollment.setStatus(status);
        return enrollment;
    }

    @Test
    void createEnrollment_usesLoggedStudentAndStartsPending() {
        loggedInAsStudent();
        request.setStudentId(99L); // must be ignored: a student books for their own account
        Enrollment enrollment = new Enrollment();
        when(enrollmentMapper.toEntity(request)).thenReturn(enrollment);
        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(enrollment);
        when(enrollmentMapper.toResponse(enrollment)).thenReturn(new EnrollmentResponse());

        enrollmentService.createEnrollment(request);

        assertEquals(student, enrollment.getStudent());
        assertEquals(EnrollmentStatus.PENDING, enrollment.getStatus());
        assertEquals(BigDecimal.valueOf(400), enrollment.getMonthlyPrice());
        verify(studentRepository, never()).findById(99L);
    }

    @Test
    void createEnrollment_unverifiedTutor_isRejected() {
        loggedInAsStudent();
        tutor.setIsVerified(false);

        assertThrows(BadRequestException.class, () -> enrollmentService.createEnrollment(request));
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    void createEnrollment_twiceForSameCourse_isRejected() {
        loggedInAsStudent();
        when(enrollmentRepository.existsByStudentIdAndCourseListingIdAndStatusIn(eq(1L), eq(3L), anyCollection()))
                .thenReturn(true);

        assertThrows(ConflictException.class, () -> enrollmentService.createEnrollment(request));
    }

    @Test
    void createEnrollment_fullCourse_isRejected() {
        loggedInAsStudent();
        when(enrollmentRepository.countByCourseListingIdAndStatusIn(eq(3L), anyCollection())).thenReturn(2L);

        assertThrows(ConflictException.class, () -> enrollmentService.createEnrollment(request));
    }

    @Test
    void createEnrollment_slotOfAnotherCourse_isRejected() {
        loggedInAsStudent();
        CourseListing otherListing = new CourseListing();
        otherListing.setId(50L);
        WeeklySlot slot = new WeeklySlot();
        slot.setId(7L);
        slot.setCourseListing(otherListing);
        request.setWeeklySlotId(7L);
        when(weeklySlotRepository.findById(7L)).thenReturn(Optional.of(slot));

        assertThrows(BadRequestException.class, () -> enrollmentService.createEnrollment(request));
    }

    @Test
    void updateStatus_tutorConfirmsPendingEnrollment() {
        Enrollment enrollment = enrollmentWithStatus(EnrollmentStatus.PENDING);
        when(enrollmentRepository.findById(10L)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(enrollment)).thenReturn(enrollment);
        when(enrollmentMapper.toResponse(enrollment)).thenReturn(new EnrollmentResponse());

        EnrollmentStatusRequest statusRequest = new EnrollmentStatusRequest();
        statusRequest.setStatus(EnrollmentStatus.CONFIRMED);
        enrollmentService.updateEnrollmentStatus(10L, statusRequest);

        assertEquals(EnrollmentStatus.CONFIRMED, enrollment.getStatus());
        verify(currentUserService).checkOwnerOrAdmin(2L);
    }

    @Test
    void updateStatus_completedEnrollmentCannotGoBack() {
        Enrollment enrollment = enrollmentWithStatus(EnrollmentStatus.COMPLETED);
        when(enrollmentRepository.findById(10L)).thenReturn(Optional.of(enrollment));

        EnrollmentStatusRequest statusRequest = new EnrollmentStatusRequest();
        statusRequest.setStatus(EnrollmentStatus.PENDING);

        assertThrows(BadRequestException.class, () -> enrollmentService.updateEnrollmentStatus(10L, statusRequest));
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    void updateStatus_byTutorOfAnotherCourse_isForbidden() {
        Enrollment enrollment = enrollmentWithStatus(EnrollmentStatus.PENDING);
        when(enrollmentRepository.findById(10L)).thenReturn(Optional.of(enrollment));
        doThrow(new AccessDeniedException("no")).when(currentUserService).checkOwnerOrAdmin(2L);

        EnrollmentStatusRequest statusRequest = new EnrollmentStatusRequest();
        statusRequest.setStatus(EnrollmentStatus.CONFIRMED);

        assertThrows(AccessDeniedException.class, () -> enrollmentService.updateEnrollmentStatus(10L, statusRequest));
    }

    @Test
    void deleteEnrollment_byStudent_cancelsInsteadOfDeleting() {
        Enrollment enrollment = enrollmentWithStatus(EnrollmentStatus.PENDING);
        when(enrollmentRepository.findById(10L)).thenReturn(Optional.of(enrollment));
        when(currentUserService.isAdmin()).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(1L);

        enrollmentService.deleteEnrollment(10L);

        assertEquals(EnrollmentStatus.CANCELLED, enrollment.getStatus());
        verify(enrollmentRepository).save(enrollment);
        verify(enrollmentRepository, never()).delete(any());
    }

    @Test
    void deleteEnrollment_byOtherStudent_isForbidden() {
        Enrollment enrollment = enrollmentWithStatus(EnrollmentStatus.PENDING);
        when(enrollmentRepository.findById(10L)).thenReturn(Optional.of(enrollment));
        when(currentUserService.isAdmin()).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(42L);

        assertThrows(AccessDeniedException.class, () -> enrollmentService.deleteEnrollment(10L));
    }
}
