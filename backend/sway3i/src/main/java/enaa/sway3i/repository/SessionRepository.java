package enaa.sway3i.repository;

import enaa.sway3i.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByCourseListingId(Long courseListingId);
}