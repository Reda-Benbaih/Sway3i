package enaa.sway3i.service;

import enaa.sway3i.dto.request.EnrollmentRequest;
import enaa.sway3i.dto.response.EnrollmentResponse;
import enaa.sway3i.mapper.EnrollmentMapper;
import enaa.sway3i.model.CourseListing;
import enaa.sway3i.model.Enrollment;
import enaa.sway3i.model.EnrollmentStatus;
import enaa.sway3i.model.Student;
import enaa.sway3i.repository.CourseListingRepository;
import enaa.sway3i.repository.EnrollmentRepository;
import enaa.sway3i.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseListingRepository courseListingRepository;
    private final EnrollmentMapper enrollmentMapper;

    public Page<EnrollmentResponse> getAllEnrollments(Pageable pageable) {
        Page<Enrollment> enrollments = enrollmentRepository.findAll(pageable);
        return enrollments.map(enrollmentMapper::toResponse);
    }

    public EnrollmentResponse getEnrollmentById(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("enrollment with "+ id + " does not exist"));
        return enrollmentMapper.toResponse(enrollment);
    }

    public EnrollmentResponse createEnrollment(EnrollmentRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("student with this " + request.getStudentId() +"does not exist"));

        CourseListing courseListing = courseListingRepository.findById(request.getCourseListingId())
                .orElseThrow(() -> new RuntimeException("course listing with this" + request.getCourseListingId() + " does not exist"));

        Enrollment enrollment = enrollmentMapper.toEntity(request);
        enrollment.setStudent(student);
        enrollment.setCourseListing(courseListing);
        enrollment.setRequestedAt(LocalDateTime.now());
        enrollment.setStatus(EnrollmentStatus.PENDING);
        enrollment.setMonthlyPrice(courseListing.getMonthlyPrice());

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return enrollmentMapper.toResponse(savedEnrollment);
    }

    public EnrollmentResponse updateEnrollment(Long id, EnrollmentRequest request) {
        Enrollment existingEnrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("enrollment with this " + id + " does not exist"));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("student with this " + request.getStudentId() + " does not exist"));

        CourseListing courseListing = courseListingRepository.findById(request.getCourseListingId())
                .orElseThrow(() -> new RuntimeException("course listing with this " + request.getCourseListingId() + " does not exist"));

        existingEnrollment.setStartDate(request.getStartDate());
        existingEnrollment.setEndDate(request.getEndDate());
        existingEnrollment.setStudent(student);
        existingEnrollment.setCourseListing(courseListing);

        Enrollment updatedEnrollment = enrollmentRepository.save(existingEnrollment);
        return enrollmentMapper.toResponse(updatedEnrollment);
    }

    public void deleteEnrollment(Long id) {
        if (!enrollmentRepository.existsById(id)) {
            throw new RuntimeException("enrollment with this" + id + " does not exist");
        }
        enrollmentRepository.deleteById(id);
    }
}
