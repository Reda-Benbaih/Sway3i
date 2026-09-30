package enaa.sway3i.repository;

import enaa.sway3i.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByEnrollmentId(Long enrollmentId);
    boolean existsByEnrollmentId(Long enrollmentId);
    long countByEnrollment_CourseListing_Tutor_Id(Long tutorId);
    List<Review> findByEnrollment_CourseListing_Tutor_Id(Long tutorId);

    @Query("select avg(r.rating) from Review r where r.enrollment.courseListing.tutor.id = :tutorId")
    Double findAverageRatingByTutorId(@Param("tutorId") Long tutorId);
}
