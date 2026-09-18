package enaa.sway3i.service;

import enaa.sway3i.dto.request.CourseListingRequest;
import enaa.sway3i.dto.response.CourseListingResponse;
import enaa.sway3i.mapper.CourseListingMapper;
import enaa.sway3i.model.CourseListing;
import enaa.sway3i.model.Subject;
import enaa.sway3i.model.Tutor;
import enaa.sway3i.repository.CourseListingRepository;
import enaa.sway3i.repository.SubjectRepository;
import enaa.sway3i.repository.TutorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseListingService {

    private final CourseListingRepository courseListingRepository;
    private final TutorRepository tutorRepository;
    private final SubjectRepository subjectRepository;
    private final CourseListingMapper courseListingMapper;

    public Page<CourseListingResponse> getAllCourseListings(Pageable pageable) {
        Page<CourseListing> courseListings = courseListingRepository.findAll(pageable);
        return courseListings.map(courseListingMapper::toResponse);
    }

    public CourseListingResponse getCourseListingById(Long id) {
        CourseListing courseListing = courseListingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("course listing with this " + id + " does not exist"));
        return courseListingMapper.toResponse(courseListing);
    }

    public CourseListingResponse createCourseListing(CourseListingRequest request) {
        Tutor tutor = tutorRepository.findById(request.getTutorId())
                .orElseThrow(() -> new RuntimeException("tutor with this " + request.getTutorId() + " does not exist"));
        
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("subject with this " + request.getSubjectId() + " does not exist"));

        CourseListing courseListing = courseListingMapper.toEntity(request);
        courseListing.setTutor(tutor);
        courseListing.setSubject(subject);
        courseListing.setIsActive(true);

        CourseListing savedCourseListing = courseListingRepository.save(courseListing);
        return courseListingMapper.toResponse(savedCourseListing);
    }

    public CourseListingResponse updateCourseListing(Long id, CourseListingRequest request) {
        CourseListing existingCourseListing = courseListingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("course listing with this " + id + " does not exist"));

        Tutor tutor = tutorRepository.findById(request.getTutorId())
                .orElseThrow(() -> new RuntimeException("tutor with this " + request.getTutorId() + " does not exist"));
        
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("subject with this " + request.getSubjectId() + " does not exist"));

        existingCourseListing.setTitle(request.getTitle());
        existingCourseListing.setDescription(request.getDescription());
        existingCourseListing.setCourseType(request.getCourseType());
        existingCourseListing.setCourseFormat(request.getCourseFormat());
        existingCourseListing.setMonthlyPrice(request.getMonthlyPrice());
        existingCourseListing.setMaxCapacity(request.getMaxCapacity());
        existingCourseListing.setLocationOrLink(request.getLocationOrLink());
        existingCourseListing.setTutor(tutor);
        existingCourseListing.setSubject(subject);

        CourseListing updatedCourseListing = courseListingRepository.save(existingCourseListing);
        return courseListingMapper.toResponse(updatedCourseListing);
    }

    public void deleteCourseListing(Long id) {
        if (!courseListingRepository.existsById(id)) {
            throw new RuntimeException("course listing with this " + id + " does not exist");
        }
        courseListingRepository.deleteById(id);
    }
}
