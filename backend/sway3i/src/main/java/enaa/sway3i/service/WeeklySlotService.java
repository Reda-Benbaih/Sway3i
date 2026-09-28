package enaa.sway3i.service;

import enaa.sway3i.dto.request.WeeklySlotRequest;
import enaa.sway3i.dto.response.WeeklySlotResponse;
import enaa.sway3i.exception.ResourceNotFoundException;
import enaa.sway3i.mapper.WeeklySlotMapper;
import enaa.sway3i.model.CourseListing;
import enaa.sway3i.model.WeeklySlot;
import enaa.sway3i.repository.CourseListingRepository;
import enaa.sway3i.repository.WeeklySlotRepository;
import enaa.sway3i.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WeeklySlotService {

    private final WeeklySlotRepository weeklySlotRepository;
    private final CourseListingRepository courseListingRepository;
    private final WeeklySlotMapper weeklySlotMapper;
    private final CurrentUserService currentUserService;

    public Page<WeeklySlotResponse> getAllWeeklySlots(Pageable pageable) {
        Page<WeeklySlot> weeklySlots = weeklySlotRepository.findAll(pageable);
        return weeklySlots.map(weeklySlotMapper::toResponse);
    }

    public List<WeeklySlotResponse> getWeeklySlotsByCourseListing(Long courseListingId) {
        return weeklySlotMapper.toResponseList(weeklySlotRepository.findByCourseListingId(courseListingId));
    }

    public WeeklySlotResponse getWeeklySlotById(Long id) {
        return weeklySlotMapper.toResponse(findWeeklySlot(id));
    }

    public WeeklySlotResponse createWeeklySlot(WeeklySlotRequest request) {
        CourseListing courseListing = findOwnedCourseListing(request.getCourseListingId());

        WeeklySlot weeklySlot = weeklySlotMapper.toEntity(request);
        weeklySlot.setCourseListing(courseListing);

        WeeklySlot savedWeeklySlot = weeklySlotRepository.save(weeklySlot);
        return weeklySlotMapper.toResponse(savedWeeklySlot);
    }

    public WeeklySlotResponse updateWeeklySlot(Long id, WeeklySlotRequest request) {
        WeeklySlot existingWeeklySlot = findWeeklySlot(id);
        currentUserService.checkOwnerOrAdmin(existingWeeklySlot.getCourseListing().getTutor().getId());
        CourseListing courseListing = findOwnedCourseListing(request.getCourseListingId());

        existingWeeklySlot.setDayOfWeek(request.getDayOfWeek());
        existingWeeklySlot.setStartTime(request.getStartTime());
        existingWeeklySlot.setEndTime(request.getEndTime());
        existingWeeklySlot.setCourseListing(courseListing);

        WeeklySlot updatedWeeklySlot = weeklySlotRepository.save(existingWeeklySlot);
        return weeklySlotMapper.toResponse(updatedWeeklySlot);
    }

    public void deleteWeeklySlot(Long id) {
        WeeklySlot weeklySlot = findWeeklySlot(id);
        currentUserService.checkOwnerOrAdmin(weeklySlot.getCourseListing().getTutor().getId());
        weeklySlotRepository.delete(weeklySlot);
    }

    private CourseListing findOwnedCourseListing(Long courseListingId) {
        CourseListing courseListing = courseListingRepository.findById(courseListingId)
                .orElseThrow(() -> new ResourceNotFoundException("course listing with this " + courseListingId + " does not exist"));
        currentUserService.checkOwnerOrAdmin(courseListing.getTutor().getId());
        return courseListing;
    }

    private WeeklySlot findWeeklySlot(Long id) {
        return weeklySlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("weekly slot with this " + id + " does not exist"));
    }
}
