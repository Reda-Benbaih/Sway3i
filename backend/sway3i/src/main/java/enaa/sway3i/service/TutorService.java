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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TutorService {

    private final TutorRepository tutorRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final ReviewRepository reviewRepository;
    private final TutorMapper tutorMapper;
    private final PasswordEncoder passwordEncoder;

    public Page<TutorResponse> getAllTutors(Pageable pageable) {
        Page<Tutor> tutors = tutorRepository.findAll(pageable);
        return tutors.map(tutorMapper::toResponse);
    }

    public Page<TutorResponse> getTutorsPendingVerification(Pageable pageable) {
        return tutorRepository.findNotVerified(pageable).map(tutorMapper::toResponse);
    }

    public TutorResponse getTutorById(Long id) {
        return tutorMapper.toResponse(findTutor(id));
    }

    public TutorResponse createTutor(TutorRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with the email " + request.getEmail() + " already exists");
        }

        Tutor tutor = tutorMapper.toEntity(request);
        tutor.setPassword(passwordEncoder.encode(tutor.getPassword()));
        tutor.setRole(Role.TUTOR);
        tutor.setCreatedAt(LocalDateTime.now());
        tutor.setIsVerified(false);
        tutor.setSubjects(findSubjects(request.getSubjectIds()));

        Tutor savedTutor = tutorRepository.save(tutor);
        return tutorMapper.toResponse(savedTutor);
    }

    public TutorResponse updateTutor(Long id, TutorRequest request) {
        Tutor existingTutor = findTutor(id);

        if (!existingTutor.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with the email " + request.getEmail() + " already exists");
        }

        existingTutor.setFirstName(request.getFirstName());
        existingTutor.setLastName(request.getLastName());
        existingTutor.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            existingTutor.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        existingTutor.setPhone(request.getPhone());
        existingTutor.setCity(request.getCity());
        existingTutor.setBiography(request.getBiography());
        existingTutor.setDegree(request.getDegree());
        existingTutor.setNationalId(request.getNationalId());
        existingTutor.setHourlyRate(request.getHourlyRate());
        existingTutor.setTeachingZones(request.getTeachingZones());
        if (request.getSubjectIds() != null) {
            existingTutor.setSubjects(findSubjects(request.getSubjectIds()));
        }

        Tutor updatedTutor = tutorRepository.save(existingTutor);
        return tutorMapper.toResponse(updatedTutor);
    }

    // only an admin can call this (checked in the controller)
    public TutorResponse setVerified(Long id, boolean verified) {
        Tutor tutor = findTutor(id);
        tutor.setIsVerified(verified);
        return tutorMapper.toResponse(tutorRepository.save(tutor));
    }

    // called every time a review is added, changed or removed
    public void refreshAverageRating(Long tutorId) {
        Tutor tutor = findTutor(tutorId);
        Double average = reviewRepository.findAverageRatingByTutorId(tutorId);
        tutor.setAverageRating(average == null ? null : Math.round(average * 10) / 10.0);
        tutorRepository.save(tutor);
    }

    public void deleteTutor(Long id) {
        if (!tutorRepository.existsById(id)) {
            throw new ResourceNotFoundException("tutor with this " + id + " does not exist");
        }
        tutorRepository.deleteById(id);
    }

    private Tutor findTutor(Long id) {
        return tutorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("tutor with this " + id + " does not exist"));
    }

    private Set<Subject> findSubjects(List<Long> subjectIds) {
        if (subjectIds == null || subjectIds.isEmpty()) {
            return new HashSet<>();
        }
        List<Subject> subjects = subjectRepository.findAllById(subjectIds);
        if (subjects.size() != new HashSet<>(subjectIds).size()) {
            throw new ResourceNotFoundException("one or more subjects do not exist");
        }
        return new HashSet<>(subjects);
    }
}
