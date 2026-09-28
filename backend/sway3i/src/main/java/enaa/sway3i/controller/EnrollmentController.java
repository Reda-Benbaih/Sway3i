package enaa.sway3i.controller;

import enaa.sway3i.dto.request.EnrollmentRequest;
import enaa.sway3i.dto.request.EnrollmentStatusRequest;
import enaa.sway3i.dto.response.EnrollmentResponse;
import enaa.sway3i.service.EnrollmentService;
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
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<EnrollmentResponse>> getAllEnrollments(Pageable pageable) {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments(pageable));
    }

    @GetMapping("/by-student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or #studentId == principal.user.id")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollmentsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(studentId));
    }

    @GetMapping("/by-tutor/{tutorId}")
    @PreAuthorize("hasRole('ADMIN') or #tutorId == principal.user.id")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollmentsByTutor(@PathVariable Long tutorId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByTutor(tutorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnrollmentResponse> getEnrollmentById(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<EnrollmentResponse> createEnrollment(@Valid @RequestBody EnrollmentRequest request) {
        return new ResponseEntity<>(enrollmentService.createEnrollment(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EnrollmentResponse> updateEnrollment(@PathVariable Long id, @Valid @RequestBody EnrollmentRequest request) {
        return ResponseEntity.ok(enrollmentService.updateEnrollment(id, request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<EnrollmentResponse> updateEnrollmentStatus(@PathVariable Long id, @Valid @RequestBody EnrollmentStatusRequest request) {
        return ResponseEntity.ok(enrollmentService.updateEnrollmentStatus(id, request));
    }

    // students and tutors cancel the enrollment, an admin deletes it
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TUTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        return ResponseEntity.noContent().build();
    }
}
