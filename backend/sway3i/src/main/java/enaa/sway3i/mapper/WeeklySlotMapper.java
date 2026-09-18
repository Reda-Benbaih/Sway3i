package enaa.sway3i.mapper;

import enaa.sway3i.dto.request.WeeklySlotRequest;
import enaa.sway3i.dto.response.WeeklySlotResponse;
import enaa.sway3i.model.WeeklySlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WeeklySlotMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "courseListing", ignore = true)
    WeeklySlot toEntity(WeeklySlotRequest request);

    WeeklySlotResponse toResponse(WeeklySlot entity);

    List<WeeklySlotResponse> toResponseList(List<WeeklySlot> entities);
}
