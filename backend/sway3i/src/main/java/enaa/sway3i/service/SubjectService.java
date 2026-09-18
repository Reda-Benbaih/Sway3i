package enaa.sway3i.service;

import enaa.sway3i.dto.request.SubjectRequest;
import enaa.sway3i.dto.response.SubjectResponse;
import enaa.sway3i.mapper.SubjectMapper;
import enaa.sway3i.model.Subject;
import enaa.sway3i.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final SubjectMapper subjectMapper;

    public Page<SubjectResponse> getAllSubjects(Pageable pageable) {
        Page<Subject> subjects = subjectRepository.findAll(pageable);
        return subjects.map(subjectMapper::toResponse);
    }

    public SubjectResponse getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("subject with this" + id+"does not exist"));
        return subjectMapper.toResponse(subject);
    }

    public SubjectResponse createSubject(SubjectRequest request) {
        Subject subject = subjectMapper.toEntity(request);
        Subject savedSubject = subjectRepository.save(subject);
        return subjectMapper.toResponse(savedSubject);
    }

    public SubjectResponse updateSubject(Long id, SubjectRequest request) {
        Subject existingSubject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("subject with this" + id+"does not exist"));

        existingSubject.setName(request.getName());
        existingSubject.setDescription(request.getDescription());

        Subject updatedSubject = subjectRepository.save(existingSubject);
        return subjectMapper.toResponse(updatedSubject);
    }

    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new RuntimeException("subject with this" + id+"does not exist");
        }
        subjectRepository.deleteById(id);
    }
}
