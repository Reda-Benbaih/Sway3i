package enaa.sway3i.controller;

import enaa.sway3i.dto.request.WeeklySlotRequest;
import enaa.sway3i.dto.response.WeeklySlotResponse;
import enaa.sway3i.service.WeeklySlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/weekly-slots")
@RequiredArgsConstructor
public class WeeklySlotController {

    private final WeeklySlotService weeklySlotService;

    @GetMapping
    public ResponseEntity<Page<WeeklySlotResponse>> getAllWeeklySlots(Pageable pageable) {
        return ResponseEntity.ok(weeklySlotService.getAllWeeklySlots(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeeklySlotResponse> getWeeklySlotById(@PathVariable Long id) {
        return ResponseEntity.ok(weeklySlotService.getWeeklySlotById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<WeeklySlotResponse> createWeeklySlot(@Valid @RequestBody WeeklySlotRequest request) {
        return new ResponseEntity<>(weeklySlotService.createWeeklySlot(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<WeeklySlotResponse> updateWeeklySlot(@PathVariable Long id, @Valid @RequestBody WeeklySlotRequest request) {
        return ResponseEntity.ok(weeklySlotService.updateWeeklySlot(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TUTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteWeeklySlot(@PathVariable Long id) {
        weeklySlotService.deleteWeeklySlot(id);
        return ResponseEntity.noContent().build();
    }
}
