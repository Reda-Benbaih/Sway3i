package enaa.sway3i.service;

import enaa.sway3i.dto.request.WeeklySlotRequest;
import enaa.sway3i.dto.response.WeeklySlotResponse;
import enaa.sway3i.mapper.WeeklySlotMapper;
import enaa.sway3i.model.CourseListing;
import enaa.sway3i.model.WeeklySlot;
import enaa.sway3i.repository.CourseListingRepository;
import enaa.sway3i.repository.WeeklySlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WeeklySlotService {

    private final WeeklySlotRepository weeklySlotRepository;
    private final CourseListingRepository courseListingRepository;
    private final WeeklySlotMapper weeklySlotMapper;

    public Page<WeeklySlotResponse> getAllWeeklySlots(Pageable pageable) {
        Page<WeeklySlot> weeklySlots = weeklySlotRepository.findAll(pageable);
        return weeklySlots.map(weeklySlotMapper::toResponse);
    }

    public WeeklySlotResponse getWeeklySlotById(Long id) {
        WeeklySlot weeklySlot = weeklySlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("weekly slot with this "+ id + "does not exist"));
        return weeklySlotMapper.toResponse(weeklySlot);
    }

    public WeeklySlotResponse createWeeklySlot(WeeklySlotRequest request) {
        CourseListing courseListing = courseListingRepository.findById(request.getCourseListingId())
                .orElseThrow(() -> new RuntimeException("course listing with this "+ request.getCourseListingId()+ "oes not exist"));

        WeeklySlot weeklySlot = weeklySlotMapper.toEntity(request);
        weeklySlot.setCourseListing(courseListing);

        WeeklySlot savedWeeklySlot = weeklySlotRepository.save(weeklySlot);
        return weeklySlotMapper.toResponse(savedWeeklySlot);
    }

    public WeeklySlotResponse updateWeeklySlot(Long id, WeeklySlotRequest request) {
        WeeklySlot existingWeeklySlot = weeklySlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("weekly slot with this " + id + " does not exist"));

        CourseListing courseListing = courseListingRepository.findById(request.getCourseListingId())
                .orElseThrow(() -> new RuntimeException("course listing with this"+ request.getCourseListingId() +"does not exist"));

        existingWeeklySlot.setDayOfWeek(request.getDayOfWeek());
        existingWeeklySlot.setStartTime(request.getStartTime());
        existingWeeklySlot.setEndTime(request.getEndTime());
        existingWeeklySlot.setCourseListing(courseListing);

        WeeklySlot updatedWeeklySlot = weeklySlotRepository.save(existingWeeklySlot);
        return weeklySlotMapper.toResponse(updatedWeeklySlot);
    }

    public void deleteWeeklySlot(Long id) {
        if (!weeklySlotRepository.existsById(id)) {
            throw new RuntimeException("weekly slot with this" + id + " does not exist");
        }
        weeklySlotRepository.deleteById(id);
    }
}
