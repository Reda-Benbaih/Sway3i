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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CourseListingServiceTest {

    @Mock
    private CourseListingRepository courseListingRepository;

    @Mock
    private TutorRepository tutorRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private CourseListingMapper courseListingMapper;

    @InjectMocks
    private CourseListingService courseListingService;

    private CourseListing courseListing;
    private CourseListingRequest courseListingRequest;
    private CourseListingResponse courseListingResponse;
    private Tutor tutor;
    private Subject subject;

    @BeforeEach
    void setUp() {
        tutor = new Tutor();
        tutor.setId(1L);

        subject = new Subject();
        subject.setId(1L);

        courseListing = new CourseListing();
        courseListing.setId(1L);
        courseListing.setTutor(tutor);
        courseListing.setSubject(subject);

        courseListingRequest = new CourseListingRequest();
        courseListingRequest.setTutorId(1L);
        courseListingRequest.setSubjectId(1L);

        courseListingResponse = new CourseListingResponse();
        courseListingResponse.setId(1L);
    }

    @Test
    void getAllCourseListings() {
        PageRequest pageRequest = PageRequest.of(0, 10);
        Page<CourseListing> page = new PageImpl<>(Collections.singletonList(courseListing));
        
        when(courseListingRepository.findAll(pageRequest)).thenReturn(page);
        when(courseListingMapper.toResponse(any(CourseListing.class))).thenReturn(courseListingResponse);

        Page<CourseListingResponse> result = courseListingService.getAllCourseListings(pageRequest);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(courseListingRepository).findAll(pageRequest);
    }

    @Test
    void getCourseListingById_success() {
        when(courseListingRepository.findById(1L)).thenReturn(Optional.of(courseListing));
        when(courseListingMapper.toResponse(courseListing)).thenReturn(courseListingResponse);

        CourseListingResponse result = courseListingService.getCourseListingById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(courseListingRepository).findById(1L);
    }

    @Test
    void getCourseListingById_notFound() {
        when(courseListingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> courseListingService.getCourseListingById(1L));
        verify(courseListingRepository).findById(1L);
    }

    @Test
    void createCourseListing_success() {
        when(tutorRepository.findById(1L)).thenReturn(Optional.of(tutor));
        when(subjectRepository.findById(1L)).thenReturn(Optional.of(subject));
        when(courseListingMapper.toEntity(courseListingRequest)).thenReturn(courseListing);
        when(courseListingRepository.save(any(CourseListing.class))).thenReturn(courseListing);
        when(courseListingMapper.toResponse(courseListing)).thenReturn(courseListingResponse);

        CourseListingResponse result = courseListingService.createCourseListing(courseListingRequest);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertTrue(courseListing.getIsActive());
        verify(courseListingRepository).save(any(CourseListing.class));
    }

    @Test
    void updateCourseListing_success() {
        when(courseListingRepository.findById(1L)).thenReturn(Optional.of(courseListing));
        when(tutorRepository.findById(1L)).thenReturn(Optional.of(tutor));
        when(subjectRepository.findById(1L)).thenReturn(Optional.of(subject));
        when(courseListingRepository.save(any(CourseListing.class))).thenReturn(courseListing);
        when(courseListingMapper.toResponse(courseListing)).thenReturn(courseListingResponse);

        CourseListingResponse result = courseListingService.updateCourseListing(1L, courseListingRequest);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(courseListingRepository).save(any(CourseListing.class));
    }

    @Test
    void deleteCourseListing_success() {
        when(courseListingRepository.existsById(1L)).thenReturn(true);
        doNothing().when(courseListingRepository).deleteById(1L);

        courseListingService.deleteCourseListing(1L);

        verify(courseListingRepository).deleteById(1L);
    }

    @Test
    void deleteCourseListing_notFound() {
        when(courseListingRepository.existsById(1L)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> courseListingService.deleteCourseListing(1L));
        verify(courseListingRepository, never()).deleteById(anyLong());
    }
}
