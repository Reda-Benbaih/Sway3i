package enaa.sway3i.service;

import enaa.sway3i.dto.request.CourseListingRequest;
import enaa.sway3i.dto.response.CourseListingResponse;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
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

    @Mock
    private CurrentUserService currentUserService;

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
        when(currentUserService.isAdmin()).thenReturn(false);
        when(currentUserService.getCurrentUserId()).thenReturn(1L);
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
        when(courseListingRepository.findById(1L)).thenReturn(Optional.of(courseListing));

        courseListingService.deleteCourseListing(1L);

        verify(courseListingRepository).deleteById(1L);
    }

    @Test
    void deleteCourseListing_notFound() {
        when(courseListingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> courseListingService.deleteCourseListing(1L));
        verify(courseListingRepository, never()).deleteById(anyLong());
    }

    @Test
    void updateCourseListing_byAnotherTutor_isForbidden() {
        when(courseListingRepository.findById(1L)).thenReturn(Optional.of(courseListing));
        doThrow(new AccessDeniedException("no")).when(currentUserService).checkOwnerOrAdmin(1L);

        assertThrows(AccessDeniedException.class,
                () -> courseListingService.updateCourseListing(1L, courseListingRequest));
        verify(courseListingRepository, never()).save(any());
    }

    @Test
    void searchCourseListings_hidesUnverifiedTutorsAndFiltersByLevel() {
        ReflectionTestUtils.setField(courseListingService, "verifiedTutorsOnly", true);

        Tutor verifiedTutor = new Tutor();
        verifiedTutor.setId(2L);
        verifiedTutor.setIsVerified(true);
        verifiedTutor.setCity("Rabat");

        CourseListing highSchoolMaths = listing(10L, verifiedTutor, Level.HIGH_SCHOOL);
        CourseListing primaryMaths = listing(11L, verifiedTutor, Level.PRIMARY);
        CourseListing fromUnverifiedTutor = listing(12L, tutor, Level.HIGH_SCHOOL);

        when(courseListingRepository.findByIsActiveTrue())
                .thenReturn(List.of(highSchoolMaths, primaryMaths, fromUnverifiedTutor));
        when(courseListingMapper.toResponse(highSchoolMaths)).thenReturn(courseListingResponse);

        List<CourseListingResponse> result = courseListingService.searchCourseListings(
                null, null, Level.HIGH_SCHOOL, null, null, null, "rabat");

        assertEquals(1, result.size());
        verify(courseListingMapper).toResponse(highSchoolMaths);
        verify(courseListingMapper, never()).toResponse(fromUnverifiedTutor);
    }

    private CourseListing listing(Long id, Tutor owner, Level level) {
        CourseListing listing = new CourseListing();
        listing.setId(id);
        listing.setTutor(owner);
        listing.setSubject(subject);
        listing.setLevel(level);
        listing.setMonthlyPrice(BigDecimal.valueOf(300));
        listing.setCourseFormat(CourseFormat.IN_PERSON);
        listing.setIsActive(true);
        return listing;
    }
}
