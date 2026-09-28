package enaa.sway3i.mapper;

import enaa.sway3i.dto.request.ReviewRequest;
import enaa.sway3i.dto.response.ReviewResponse;
import enaa.sway3i.model.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = UserNameMapper.class)
public interface ReviewMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "enrollment", ignore = true)
    Review toEntity(ReviewRequest request);

    @Mapping(target = "enrollmentId", source = "enrollment.id")
    @Mapping(target = "studentId", source = "enrollment.student.id")
    @Mapping(target = "studentName", source = "enrollment.student", qualifiedByName = "fullName")
    @Mapping(target = "tutorId", source = "enrollment.courseListing.tutor.id")
    @Mapping(target = "courseTitle", source = "enrollment.courseListing.title")
    ReviewResponse toResponse(Review entity);

    List<ReviewResponse> toResponseList(List<Review> entities);
}
