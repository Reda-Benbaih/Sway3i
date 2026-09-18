package enaa.sway3i.mapper;

import enaa.sway3i.dto.request.CourseListingRequest;
import enaa.sway3i.dto.response.CourseListingResponse;
import enaa.sway3i.model.CourseListing;
import enaa.sway3i.model.Tutor;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring", uses = WeeklySlotMapper.class)
public interface CourseListingMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tutor", ignore = true)
    @Mapping(target = "subject", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    CourseListing toEntity(CourseListingRequest request);

    @AfterMapping
    default void linkSlots(@MappingTarget CourseListing course) {
        if (course.getWeeklySlots() != null) {
            course.getWeeklySlots().forEach(slot -> slot.setCourseListing(course));
        }
    }

    @Mapping(target = "tutorId", source = "tutor.id")
    @Mapping(target = "tutorName", source = "tutor", qualifiedByName = "tutorFullName")
    @Mapping(target = "subjectId", source = "subject.id")
    @Mapping(target = "subjectName", source = "subject.name")
    CourseListingResponse toResponse(CourseListing entity);

    List<CourseListingResponse> toResponseList(List<CourseListing> entities);

    @Named("tutorFullName")
    default String tutorFullName(Tutor tutor) {
        if (tutor == null) {
            return null;
        }
        String first = tutor.getFirstName() == null ? "" : tutor.getFirstName();
        String last = tutor.getLastName() == null ? "" : tutor.getLastName();
        return (first + " " + last).trim();
    }
}
