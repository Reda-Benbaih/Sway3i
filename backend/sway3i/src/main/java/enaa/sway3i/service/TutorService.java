package enaa.sway3i.service;

import enaa.sway3i.dto.request.TutorRequest;
import enaa.sway3i.dto.response.TutorResponse;
import enaa.sway3i.mapper.TutorMapper;
import enaa.sway3i.model.Tutor;
import enaa.sway3i.repository.TutorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TutorService {

    private final TutorRepository tutorRepository;
    private final TutorMapper tutorMapper;

    public Page<TutorResponse> getAllTutors(Pageable pageable) {
        Page<Tutor> tutors = tutorRepository.findAll(pageable);
        return tutors.map(tutorMapper::toResponse);
    }

    public TutorResponse getTutorById(Long id) {
        Tutor tutor = tutorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("tutor with this " + id + " does not exist"));
        return tutorMapper.toResponse(tutor);
    }

    public TutorResponse createTutor(TutorRequest request) {
        Tutor tutor = tutorMapper.toEntity(request);
        Tutor savedTutor = tutorRepository.save(tutor);
        return tutorMapper.toResponse(savedTutor);
    }

    public TutorResponse updateTutor(Long id, TutorRequest request) {
        Tutor existingTutor = tutorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("tutor with this " + id + " does not exist"));

        existingTutor.setFirstName(request.getFirstName());
        existingTutor.setLastName(request.getLastName());
        existingTutor.setEmail(request.getEmail());
        existingTutor.setPassword(request.getPassword());
        existingTutor.setPhone(request.getPhone());
        existingTutor.setCity(request.getCity());
        existingTutor.setBiography(request.getBiography());
        existingTutor.setDegree(request.getDegree());
        existingTutor.setNationalId(request.getNationalId());

        Tutor updatedTutor = tutorRepository.save(existingTutor);
        return tutorMapper.toResponse(updatedTutor);
    }

    public void deleteTutor(Long id) {
        if (!tutorRepository.existsById(id)) {
            throw new RuntimeException("tutor with this " + id + " does not exist");
        }
        tutorRepository.deleteById(id);
    }
}
