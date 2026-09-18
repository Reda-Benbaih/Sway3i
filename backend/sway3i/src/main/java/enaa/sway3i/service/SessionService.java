package enaa.sway3i.service;

import enaa.sway3i.dto.request.SessionRequest;
import enaa.sway3i.dto.response.SessionResponse;
import enaa.sway3i.mapper.SessionMapper;
import enaa.sway3i.model.CourseListing;
import enaa.sway3i.model.Session;
import enaa.sway3i.model.SessionStatus;
import enaa.sway3i.repository.CourseListingRepository;
import enaa.sway3i.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final CourseListingRepository courseListingRepository;
    private final SessionMapper sessionMapper;

    public Page<SessionResponse> getAllSessions(Pageable pageable) {
        Page<Session> sessions = sessionRepository.findAll(pageable);
        return sessions.map(sessionMapper::toResponse);
    }

    public SessionResponse getSessionById(Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("session with this " + id + " does not exist"));
        return sessionMapper.toResponse(session);
    }

    public SessionResponse createSession(SessionRequest request) {
        CourseListing courseListing = courseListingRepository.findById(request.getCourseListingId())
                .orElseThrow(() -> new RuntimeException("course listing with this " + request.getCourseListingId() + " does not exist"));

        Session session = sessionMapper.toEntity(request);
        session.setCourseListing(courseListing);
        session.setStatus(SessionStatus.SCHEDULED);

        Session savedSession = sessionRepository.save(session);
        return sessionMapper.toResponse(savedSession);
    }

    public SessionResponse updateSession(Long id, SessionRequest request) {
        Session existingSession = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("session with this " + id + " does not exist"));

        CourseListing courseListing = courseListingRepository.findById(request.getCourseListingId())
                .orElseThrow(() -> new RuntimeException("course listing with this " + request.getCourseListingId() + " does not exist"));

        existingSession.setDate(request.getDate());
        existingSession.setStartTime(request.getStartTime());
        existingSession.setEndTime(request.getEndTime());
        existingSession.setCourseListing(courseListing);

        Session updatedSession = sessionRepository.save(existingSession);
        return sessionMapper.toResponse(updatedSession);
    }

    public void deleteSession(Long id) {
        if (!sessionRepository.existsById(id)) {
            throw new RuntimeException("session with this " + id + " does not exist");
        }
        sessionRepository.deleteById(id);
    }
}
