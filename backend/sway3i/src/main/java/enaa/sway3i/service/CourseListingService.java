package enaa.sway3i.service;

import enaa.sway3i.dto.request.CourseListingRequest;
import enaa.sway3i.dto.response.CourseListingResponse;
import enaa.sway3i.exception.BadRequestException;
import enaa.sway3i.exception.ResourceNotFoundException;
import enaa.sway3i.mapper.CourseListingMapper;
import enaa.sway3i.model.CourseFormat;
import enaa.sway3i.model.CourseListing;
import enaa.sway3i.model.Level;
import enaa.sway3i.model.Subject;
import enaa.sway3i.model.Tutor;
import enaa.sway3i.repository.CourseListingRepository;
import enaa.sway3i.repository.SubjectRepository;
import enaa.sway3i.repository.TutorRepository;
import enaa.sway3i.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseListingService {

    private final CourseListingRepository courseListingRepository;
    private final TutorRepository tutorRepository;
    private final SubjectRepository subjectRepository;
    private final CourseListingMapper courseListingMapper;
    private final CurrentUserService currentUserService;

    @Value("${app.discovery.verified-tutors-only:true}")
    private boolean verifiedTutorsOnly;

    public Page<CourseListingResponse> getAllCourseListings(Pageable pageable) {
        Page<CourseListing> courseListings = courseListingRepository.findAll(pageable);
        return courseListings.map(courseListingMapper::toResponse);
    }

    public List<CourseListingResponse> searchCourseListings(Long subjectId, CourseFormat courseFormat, Level level,
                                                            BigDecimal minPrice, BigDecimal maxPrice,
                                                            BigDecimal maxHourlyRate, String location) {
        List<CourseListing> courseListings = courseListingRepository.findByIsActiveTrue();

        return courseListings.stream()
                .filter(c -> !verifiedTutorsOnly || Boolean.TRUE.equals(c.getTutor().getIsVerified()))
                .filter(c -> subjectId == null || c.getSubject().getId().equals(subjectId))
                .filter(c -> courseFormat == null || c.getCourseFormat() == courseFormat)
                .filter(c -> level == null || c.getLevel() == null || c.getLevel() == level)
                .filter(c -> minPrice == null || c.getMonthlyPrice().compareTo(minPrice) >= 0)
                .filter(c -> maxPrice == null || c.getMonthlyPrice().compareTo(maxPrice) <= 0)
                .filter(c -> maxHourlyRate == null || (c.getTutor().getHourlyRate() != null
                        && c.getTutor().getHourlyRate().compareTo(maxHourlyRate) <= 0))
                .filter(c -> location == null || location.isBlank() || matchesLocation(c, location))
                .map(courseListingMapper::toResponse)
                .toList();
    }

    public List<CourseListingResponse> getCourseListingsByTutor(Long tutorId) {
        return courseListingRepository.findByTutorId(tutorId).stream()
                .map(courseListingMapper::toResponse)
                .toList();
    }

    public CourseListingResponse getCourseListingById(Long id) {
        return courseListingMapper.toResponse(findCourseListing(id));
    }

    public CourseListingResponse createCourseListing(CourseListingRequest request) {
        Tutor tutor = findTutor(resolveTutorId(request));
        Subject subject = findSubject(request.getSubjectId());

        CourseListing courseListing = courseListingMapper.toEntity(request);
        courseListing.setTutor(tutor);
        courseListing.setSubject(subject);
        courseListing.setIsActive(true);

        CourseListing savedCourseListing = courseListingRepository.save(courseListing);
        return courseListingMapper.toResponse(savedCourseListing);
    }

    public CourseListingResponse updateCourseListing(Long id, CourseListingRequest request) {
        CourseListing existingCourseListing = findCourseListing(id);
        currentUserService.checkOwnerOrAdmin(existingCourseListing.getTutor().getId());

        Subject subject = findSubject(request.getSubjectId());

        existingCourseListing.setTitle(request.getTitle());
        existingCourseListing.setDescription(request.getDescription());
        existingCourseListing.setCourseType(request.getCourseType());
        existingCourseListing.setCourseFormat(request.getCourseFormat());
        existingCourseListing.setLevel(request.getLevel());
        existingCourseListing.setMonthlyPrice(request.getMonthlyPrice());
        existingCourseListing.setMaxCapacity(request.getMaxCapacity());
        existingCourseListing.setLocationOrLink(request.getLocationOrLink());
        existingCourseListing.setSubject(subject);
        if (request.getIsActive() != null) {
            existingCourseListing.setIsActive(request.getIsActive());
        }
        if (currentUserService.isAdmin() && request.getTutorId() != null) {
            existingCourseListing.setTutor(findTutor(request.getTutorId()));
        }

        CourseListing updatedCourseListing = courseListingRepository.save(existingCourseListing);
        return courseListingMapper.toResponse(updatedCourseListing);
    }

    public void deleteCourseListing(Long id) {
        CourseListing courseListing = findCourseListing(id);
        currentUserService.checkOwnerOrAdmin(courseListing.getTutor().getId());
        courseListingRepository.deleteById(id);
    }

    private Long resolveTutorId(CourseListingRequest request) {
        if (!currentUserService.isAdmin()) {
            return currentUserService.getCurrentUserId();
        }
        if (request.getTutorId() == null) {
            throw new BadRequestException("Tutor ID is required");
        }
        return request.getTutorId();
    }

    private boolean matchesLocation(CourseListing courseListing, String location) {
        String search = location.toLowerCase();
        Tutor tutor = courseListing.getTutor();
        return contains(courseListing.getLocationOrLink(), search)
                || contains(tutor.getCity(), search)
                || contains(tutor.getTeachingZones(), search);
    }

    private boolean contains(String value, String search) {
        return value != null && value.toLowerCase().contains(search);
    }

    private CourseListing findCourseListing(Long id) {
        return courseListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("course listing with this " + id + " does not exist"));
    }

    private Tutor findTutor(Long id) {
        return tutorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("tutor with this " + id + " does not exist"));
    }

    private Subject findSubject(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("subject with this " + id + " does not exist"));
    }
}
