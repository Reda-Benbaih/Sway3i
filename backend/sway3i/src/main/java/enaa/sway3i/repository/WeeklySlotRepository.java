package enaa.sway3i.repository;

import enaa.sway3i.model.WeeklySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeeklySlotRepository extends JpaRepository<WeeklySlot, Long> {
    List<WeeklySlot> findByCourseListingId(Long courseListingId);
}