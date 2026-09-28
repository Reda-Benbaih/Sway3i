package enaa.sway3i.service;

import enaa.sway3i.dto.request.SessionRequest;
import enaa.sway3i.dto.response.SessionResponse;
import enaa.sway3i.exception.ResourceNotFoundException;
import enaa.sway3i.mapper.SessionMapper;
import enaa.sway3i.model.CourseListing;
import enaa.sway3i.model.Session;
import enaa.sway3i.model.SessionStatus;
import enaa.sway3i.repository.CourseListingRepository;
import enaa.sway3i.repository.SessionRepository;
import enaa.sway3i.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final CourseListingRepository courseListingRepository;
    private final SessionMapper sessionMapper;
    private final CurrentUserService currentUserService;

    public Page<SessionResponse> getAllSessions(Pageable pageable) {
        Page<Session> sessions = sessionRepository.findAll(pageable);
        return sessions.map(sessionMapper::toResponse);
    }

    public List<SessionResponse> getSessionsByCourseListing(Long courseListingId) {
        return sessionMapper.toResponseList(sessionRepository.findByCourseListingId(courseListingId));
    }

    public SessionResponse getSessionById(Long id) {
        return sessionMapper.toResponse(findSession(id));
    }

    public SessionResponse createSession(SessionRequest request) {
        CourseListing courseListing = findOwnedCourseListing(request.getCourseListingId());

        Session session = sessionMapper.toEntity(request);
        session.setCourseListing(courseListing);
        session.setStatus(SessionStatus.SCHEDULED);

        Session savedSession = sessionRepository.save(session);
        return sessionMapper.toResponse(savedSession);
    }

    public SessionResponse updateSession(Long id, SessionRequest request) {
        Session existingSession = findSession(id);
        currentUserService.checkOwnerOrAdmin(existingSession.getCourseListing().getTutor().getId());
        CourseListing courseListing = findOwnedCourseListing(request.getCourseListingId());

        existingSession.setDate(request.getDate());
        existingSession.setStartTime(request.getStartTime());
        existingSession.setEndTime(request.getEndTime());
        existingSession.setCourseListing(courseListing);
        if (request.getStatus() != null) {
            existingSession.setStatus(request.getStatus());
        }

        Session updatedSession = sessionRepository.save(existingSession);
        return sessionMapper.toResponse(updatedSession);
    }

    public void deleteSession(Long id) {
        Session session = findSession(id);
        currentUserService.checkOwnerOrAdmin(session.getCourseListing().getTutor().getId());
        sessionRepository.delete(session);
    }

    private CourseListing findOwnedCourseListing(Long courseListingId) {
        CourseListing courseListing = courseListingRepository.findById(courseListingId)
                .orElseThrow(() -> new ResourceNotFoundException("course listing with this " + courseListingId + " does not exist"));
        currentUserService.checkOwnerOrAdmin(courseListing.getTutor().getId());
        return courseListing;
    }

    private Session findSession(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("session with this " + id + " does not exist"));
    }
}
