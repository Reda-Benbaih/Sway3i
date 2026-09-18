package enaa.sway3i.repository;

import enaa.sway3i.model.CourseListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseListingRepository extends JpaRepository<CourseListing, Long> {
    List<CourseListing> findByTutorId(Long tutorId);
    List<CourseListing> findBySubjectId(Long subjectId);
}