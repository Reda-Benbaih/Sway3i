package enaa.sway3i.controller;

import enaa.sway3i.dto.request.TutorRequest;
import enaa.sway3i.dto.response.TutorResponse;
import enaa.sway3i.service.TutorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tutors")
@RequiredArgsConstructor
public class TutorController {

    private final TutorService tutorService;

    @GetMapping
    public ResponseEntity<Page<TutorResponse>> getAllTutors(Pageable pageable) {
        return ResponseEntity.ok(tutorService.getAllTutors(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TutorResponse> getTutorById(@PathVariable Long id) {
        return ResponseEntity.ok(tutorService.getTutorById(id));
    }

    @PostMapping
    public ResponseEntity<TutorResponse> createTutor(@Valid @RequestBody TutorRequest request) {
        return new ResponseEntity<>(tutorService.createTutor(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<TutorResponse> updateTutor(@PathVariable Long id, @Valid @RequestBody TutorRequest request) {
        return ResponseEntity.ok(tutorService.updateTutor(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteTutor(@PathVariable Long id) {
        tutorService.deleteTutor(id);
        return ResponseEntity.noContent().build();
    }
}
