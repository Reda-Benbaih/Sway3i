package enaa.sway3i.mapper;

import enaa.sway3i.dto.request.CourseListingRequest;
import enaa.sway3i.dto.response.CourseListingResponse;
import enaa.sway3i.model.CourseListing;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {WeeklySlotMapper.class, UserNameMapper.class})
public interface CourseListingMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tutor", ignore = true)
    @Mapping(target = "subject", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "weeklySlots", ignore = true)
    CourseListing toEntity(CourseListingRequest request);

    @AfterMapping
    default void linkSlots(@MappingTarget CourseListing course) {
        if (course.getWeeklySlots() != null) {
            course.getWeeklySlots().forEach(slot -> slot.setCourseListing(course));
        }
    }

    @Mapping(target = "tutorId", source = "tutor.id")
    @Mapping(target = "tutorName", source = "tutor", qualifiedByName = "fullName")
    @Mapping(target = "tutorCity", source = "tutor.city")
    @Mapping(target = "tutorHourlyRate", source = "tutor.hourlyRate")
    @Mapping(target = "tutorAverageRating", source = "tutor.averageRating")
    @Mapping(target = "tutorVerified", source = "tutor.isVerified")
    @Mapping(target = "subjectId", source = "subject.id")
    @Mapping(target = "subjectName", source = "subject.name")
    CourseListingResponse toResponse(CourseListing entity);

    List<CourseListingResponse> toResponseList(List<CourseListing> entities);
}
