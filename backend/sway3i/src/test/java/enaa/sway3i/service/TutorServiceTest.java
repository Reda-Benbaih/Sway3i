package enaa.sway3i.service;

import enaa.sway3i.dto.request.TutorRequest;
import enaa.sway3i.dto.response.TutorResponse;
import enaa.sway3i.exception.ConflictException;
import enaa.sway3i.exception.ResourceNotFoundException;
import enaa.sway3i.mapper.TutorMapper;
import enaa.sway3i.model.Role;
import enaa.sway3i.model.Subject;
import enaa.sway3i.model.Tutor;
import enaa.sway3i.repository.ReviewRepository;
import enaa.sway3i.repository.SubjectRepository;
import enaa.sway3i.repository.TutorRepository;
import enaa.sway3i.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TutorServiceTest {

    @Mock
    private TutorRepository tutorRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private TutorMapper tutorMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private TutorService tutorService;

    private Tutor tutor;
    private TutorRequest request;

    @BeforeEach
    void setUp() {
        tutor = new Tutor();
        tutor.setId(1L);
        tutor.setEmail("tutor@sway3i.ma");
        tutor.setPassword("secret123");

        request = new TutorRequest();
        request.setEmail("tutor@sway3i.ma");
        request.setPassword("secret123");
        request.setSubjectIds(List.of(5L));
    }

    @Test
    void createTutor_isNotVerifiedAndPasswordIsEncoded() {
        Subject maths = new Subject();
        maths.setId(5L);
        when(userRepository.existsByEmail("tutor@sway3i.ma")).thenReturn(false);
        when(tutorMapper.toEntity(request)).thenReturn(tutor);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(subjectRepository.findAllById(List.of(5L))).thenReturn(List.of(maths));
        when(tutorRepository.save(tutor)).thenReturn(tutor);
        when(tutorMapper.toResponse(tutor)).thenReturn(new TutorResponse());

        tutorService.createTutor(request);

        assertEquals("hashed", tutor.getPassword());
        assertEquals(Role.TUTOR, tutor.getRole());
        assertFalse(tutor.getIsVerified());
        assertTrue(tutor.getSubjects().contains(maths));
    }

    @Test
    void createTutor_withTakenEmail_isRejected() {
        when(userRepository.existsByEmail("tutor@sway3i.ma")).thenReturn(true);

        assertThrows(ConflictException.class, () -> tutorService.createTutor(request));
        verify(tutorRepository, never()).save(any());
    }

    @Test
    void createTutor_withUnknownSubject_isRejected() {
        when(userRepository.existsByEmail("tutor@sway3i.ma")).thenReturn(false);
        when(tutorMapper.toEntity(request)).thenReturn(tutor);
        when(subjectRepository.findAllById(List.of(5L))).thenReturn(List.of());

        assertThrows(ResourceNotFoundException.class, () -> tutorService.createTutor(request));
    }

    @Test
    void setVerified_marksTutorAsVerified() {
        when(tutorRepository.findById(1L)).thenReturn(Optional.of(tutor));
        when(tutorRepository.save(tutor)).thenReturn(tutor);
        when(tutorMapper.toResponse(tutor)).thenReturn(new TutorResponse());

        tutorService.setVerified(1L, true);

        assertTrue(tutor.getIsVerified());
    }

    @Test
    void refreshAverageRating_roundsToOneDecimal() {
        when(tutorRepository.findById(1L)).thenReturn(Optional.of(tutor));
        when(reviewRepository.findAverageRatingByTutorId(1L)).thenReturn(4.666);

        tutorService.refreshAverageRating(1L);

        assertEquals(4.7, tutor.getAverageRating());
        verify(tutorRepository).save(tutor);
    }

    @Test
    void refreshAverageRating_withoutReviews_isNull() {
        tutor.setAverageRating(3.0);
        when(tutorRepository.findById(1L)).thenReturn(Optional.of(tutor));
        when(reviewRepository.findAverageRatingByTutorId(1L)).thenReturn(null);

        tutorService.refreshAverageRating(1L);

        assertNull(tutor.getAverageRating());
    }
}
