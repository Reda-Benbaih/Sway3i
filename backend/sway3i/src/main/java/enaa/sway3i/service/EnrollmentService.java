package enaa.sway3i.service;

import enaa.sway3i.dto.request.EnrollmentRequest;
import enaa.sway3i.dto.request.EnrollmentStatusRequest;
import enaa.sway3i.dto.response.EnrollmentResponse;
import enaa.sway3i.exception.BadRequestException;
import enaa.sway3i.exception.ConflictException;
import enaa.sway3i.exception.ResourceNotFoundException;
import enaa.sway3i.mapper.EnrollmentMapper;
import enaa.sway3i.model.CourseListing;
import enaa.sway3i.model.CourseType;
import enaa.sway3i.model.Enrollment;
import enaa.sway3i.model.EnrollmentStatus;
import enaa.sway3i.model.Student;
import enaa.sway3i.model.WeeklySlot;
import enaa.sway3i.repository.CourseListingRepository;
import enaa.sway3i.repository.EnrollmentRepository;
import enaa.sway3i.repository.StudentRepository;
import enaa.sway3i.repository.WeeklySlotRepository;
import enaa.sway3i.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private static final Set<EnrollmentStatus> OPEN_STATUSES =
            Set.of(EnrollmentStatus.PENDING, EnrollmentStatus.CONFIRMED, EnrollmentStatus.ACTIVE);

    private static final Set<EnrollmentStatus> SEAT_STATUSES =
            Set.of(EnrollmentStatus.CONFIRMED, EnrollmentStatus.ACTIVE);

    private static final Map<EnrollmentStatus, Set<EnrollmentStatus>> ALLOWED_TRANSITIONS = Map.of(
            EnrollmentStatus.PENDING, Set.of(EnrollmentStatus.CONFIRMED, EnrollmentStatus.REJECTED, EnrollmentStatus.CANCELLED),
            EnrollmentStatus.CONFIRMED, Set.of(EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED, EnrollmentStatus.CANCELLED),
            EnrollmentStatus.ACTIVE, Set.of(EnrollmentStatus.COMPLETED, EnrollmentStatus.CANCELLED),
            EnrollmentStatus.REJECTED, Set.of(),
            EnrollmentStatus.CANCELLED, Set.of(),
            EnrollmentStatus.COMPLETED, Set.of()
    );

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseListingRepository courseListingRepository;
    private final WeeklySlotRepository weeklySlotRepository;
    private final EnrollmentMapper enrollmentMapper;
    private final CurrentUserService currentUserService;

    @Value("${app.discovery.verified-tutors-only:true}")
    private boolean verifiedTutorsOnly;

    public Page<EnrollmentResponse> getAllEnrollments(Pageable pageable) {
        Page<Enrollment> enrollments = enrollmentRepository.findAll(pageable);
        return enrollments.map(enrollmentMapper::toResponse);
    }

    public List<EnrollmentResponse> getEnrollmentsByStudent(Long studentId) {
        return enrollmentMapper.toResponseList(enrollmentRepository.findByStudentId(studentId));
    }

    public List<EnrollmentResponse> getEnrollmentsByTutor(Long tutorId) {
        return enrollmentMapper.toResponseList(enrollmentRepository.findByCourseListing_Tutor_Id(tutorId));
    }

    public EnrollmentResponse getEnrollmentById(Long id) {
        Enrollment enrollment = findEnrollment(id);
        checkParticipantOrAdmin(enrollment);
        return enrollmentMapper.toResponse(enrollment);
    }

    public EnrollmentResponse createEnrollment(EnrollmentRequest request) {
        Student student = findStudent(resolveStudentId(request));
        CourseListing courseListing = findCourseListing(request.getCourseListingId());

        if (!Boolean.TRUE.equals(courseListing.getIsActive())) {
            throw new BadRequestException("This course is not available for booking");
        }
        if (verifiedTutorsOnly && !Boolean.TRUE.equals(courseListing.getTutor().getIsVerified())) {
            throw new BadRequestException("This tutor has not been validated by an administrator yet");
        }
        if (enrollmentRepository.existsByStudentIdAndCourseListingIdAndStatusIn(student.getId(), courseListing.getId(), OPEN_STATUSES)) {
            throw new ConflictException("You already have a booking for this course");
        }

        WeeklySlot weeklySlot = findSlotOfListing(request.getWeeklySlotId(), courseListing);
        checkAvailability(courseListing, weeklySlot);

        Enrollment enrollment = enrollmentMapper.toEntity(request);
        enrollment.setStudent(student);
        enrollment.setCourseListing(courseListing);
        enrollment.setWeeklySlot(weeklySlot);
        enrollment.setRequestedAt(LocalDateTime.now());
        enrollment.setStatus(EnrollmentStatus.PENDING);
        enrollment.setMonthlyPrice(courseListing.getMonthlyPrice());

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return enrollmentMapper.toResponse(savedEnrollment);
    }

    public EnrollmentResponse updateEnrollment(Long id, EnrollmentRequest request) {
        Enrollment existingEnrollment = findEnrollment(id);
        CourseListing courseListing = findCourseListing(request.getCourseListingId());

        existingEnrollment.setStartDate(request.getStartDate());
        existingEnrollment.setEndDate(request.getEndDate());
        existingEnrollment.setCourseListing(courseListing);
        existingEnrollment.setWeeklySlot(findSlotOfListing(request.getWeeklySlotId(), courseListing));
        if (request.getStudentId() != null) {
            existingEnrollment.setStudent(findStudent(request.getStudentId()));
        }

        Enrollment updatedEnrollment = enrollmentRepository.save(existingEnrollment);
        return enrollmentMapper.toResponse(updatedEnrollment);
    }

    public EnrollmentResponse updateEnrollmentStatus(Long id, EnrollmentStatusRequest request) {
        Enrollment existingEnrollment = findEnrollment(id);
        currentUserService.checkOwnerOrAdmin(existingEnrollment.getCourseListing().getTutor().getId());

        EnrollmentStatus newStatus = request.getStatus();
        checkTransition(existingEnrollment.getStatus(), newStatus);

        if (newStatus == EnrollmentStatus.CONFIRMED) {
            checkAvailability(existingEnrollment.getCourseListing(), existingEnrollment.getWeeklySlot());
        }

        existingEnrollment.setStatus(newStatus);
        existingEnrollment.setRejectionReason(newStatus == EnrollmentStatus.REJECTED ? request.getRejectionReason() : null);

        Enrollment updatedEnrollment = enrollmentRepository.save(existingEnrollment);
        return enrollmentMapper.toResponse(updatedEnrollment);
    }

    public void deleteEnrollment(Long id) {
        Enrollment enrollment = findEnrollment(id);

        if (currentUserService.isAdmin()) {
            enrollmentRepository.delete(enrollment);
            return;
        }

        checkParticipantOrAdmin(enrollment);
        checkTransition(enrollment.getStatus(), EnrollmentStatus.CANCELLED);
        enrollment.setStatus(EnrollmentStatus.CANCELLED);
        enrollmentRepository.save(enrollment);
    }

    private void checkTransition(EnrollmentStatus current, EnrollmentStatus next) {
        if (!ALLOWED_TRANSITIONS.getOrDefault(current, Set.of()).contains(next)) {
            throw new BadRequestException("An enrollment cannot go from " + current + " to " + next);
        }
    }

    private void checkAvailability(CourseListing courseListing, WeeklySlot weeklySlot) {
        Integer maxCapacity = courseListing.getMaxCapacity();
        if (maxCapacity != null
                && enrollmentRepository.countByCourseListingIdAndStatusIn(courseListing.getId(), SEAT_STATUSES) >= maxCapacity) {
            throw new ConflictException("This course is full");
        }
        if (weeklySlot != null && courseListing.getCourseType() == CourseType.INDIVIDUAL
                && enrollmentRepository.existsByWeeklySlotIdAndStatusIn(weeklySlot.getId(), SEAT_STATUSES)) {
            throw new ConflictException("This time slot is already taken");
        }
    }

    private WeeklySlot findSlotOfListing(Long weeklySlotId, CourseListing courseListing) {
        if (weeklySlotId == null) {
            return null;
        }
        WeeklySlot weeklySlot = weeklySlotRepository.findById(weeklySlotId)
                .orElseThrow(() -> new ResourceNotFoundException("weekly slot with this " + weeklySlotId + " does not exist"));
        if (!weeklySlot.getCourseListing().getId().equals(courseListing.getId())) {
            throw new BadRequestException("This time slot does not belong to the selected course");
        }
        return weeklySlot;
    }

    private Long resolveStudentId(EnrollmentRequest request) {
        if (!currentUserService.isAdmin()) {
            return currentUserService.getCurrentUserId();
        }
        if (request.getStudentId() == null) {
            throw new BadRequestException("Student ID is required");
        }
        return request.getStudentId();
    }

    private void checkParticipantOrAdmin(Enrollment enrollment) {
        if (currentUserService.isAdmin()) {
            return;
        }
        Long userId = currentUserService.getCurrentUserId();
        boolean isStudent = enrollment.getStudent().getId().equals(userId);
        boolean isTutor = enrollment.getCourseListing().getTutor().getId().equals(userId);
        if (!isStudent && !isTutor) {
            throw new AccessDeniedException("You do not have permission to access this enrollment");
        }
    }

    private Enrollment findEnrollment(Long id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("enrollment with this " + id + " does not exist"));
    }

    private Student findStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("student with this " + id + " does not exist"));
    }

    private CourseListing findCourseListing(Long id) {
        return courseListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("course listing with this " + id + " does not exist"));
    }
}
