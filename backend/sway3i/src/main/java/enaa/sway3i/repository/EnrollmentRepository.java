package enaa.sway3i.repository;

import enaa.sway3i.model.Enrollment;
import enaa.sway3i.model.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentId(Long studentId);
    List<Enrollment> findByCourseListingId(Long courseListingId);
    List<Enrollment> findByCourseListing_Tutor_Id(Long tutorId);

    boolean existsByStudentIdAndCourseListingIdAndStatusIn(Long studentId, Long courseListingId, Collection<EnrollmentStatus> statuses);
    long countByCourseListingIdAndStatusIn(Long courseListingId, Collection<EnrollmentStatus> statuses);
    boolean existsByWeeklySlotIdAndStatusIn(Long weeklySlotId, Collection<EnrollmentStatus> statuses);
}
