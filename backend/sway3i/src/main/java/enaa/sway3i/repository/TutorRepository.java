package enaa.sway3i.repository;

import enaa.sway3i.model.Tutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TutorRepository extends JpaRepository<Tutor, Long> {

    @Query("select t from Tutor t where t.isVerified = false or t.isVerified is null")
    Page<Tutor> findNotVerified(Pageable pageable);

    Page<Tutor> findByIsVerifiedTrue(Pageable pageable);
}
