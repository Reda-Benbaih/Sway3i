package enaa.sway3i.controller;

import enaa.sway3i.dto.request.CourseListingRequest;
import enaa.sway3i.dto.response.CourseListingResponse;
import enaa.sway3i.model.CourseFormat;
import enaa.sway3i.service.CourseListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/course-listings")
@RequiredArgsConstructor
public class CourseListingController {

    private final CourseListingService courseListingService;

    @GetMapping
    public ResponseEntity<Page<CourseListingResponse>> getAllCourseListings(Pageable pageable) {
        return ResponseEntity.ok(courseListingService.getAllCourseListings(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<List<CourseListingResponse>> searchCourseListings(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) CourseFormat courseFormat,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(courseListingService.searchCourseListings(
                subjectId, courseFormat, minPrice, maxPrice, location));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseListingResponse> getCourseListingById(@PathVariable Long id) {
        return ResponseEntity.ok(courseListingService.getCourseListingById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<CourseListingResponse> createCourseListing(@Valid @RequestBody CourseListingRequest request) {
        return new ResponseEntity<>(courseListingService.createCourseListing(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<CourseListingResponse> updateCourseListing(@PathVariable Long id, @Valid @RequestBody CourseListingRequest request) {
        return ResponseEntity.ok(courseListingService.updateCourseListing(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteCourseListing(@PathVariable Long id) {
        courseListingService.deleteCourseListing(id);
        return ResponseEntity.noContent().build();
    }
}
