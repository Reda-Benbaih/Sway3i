package enaa.sway3i.mapper;

import enaa.sway3i.dto.request.EnrollmentRequest;
import enaa.sway3i.dto.response.EnrollmentResponse;
import enaa.sway3i.model.Enrollment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = UserNameMapper.class)
public interface EnrollmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "requestedAt", ignore = true)
    @Mapping(target = "monthlyPrice", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "courseListing", ignore = true)
    @Mapping(target = "weeklySlot", ignore = true)
    Enrollment toEntity(EnrollmentRequest request);

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student", qualifiedByName = "fullName")
    @Mapping(target = "courseListingId", source = "courseListing.id")
    @Mapping(target = "courseTitle", source = "courseListing.title")
    @Mapping(target = "weeklySlotId", source = "weeklySlot.id")
    @Mapping(target = "tutorId", source = "courseListing.tutor.id")
    @Mapping(target = "tutorName", source = "courseListing.tutor", qualifiedByName = "fullName")
    EnrollmentResponse toResponse(Enrollment entity);

    List<EnrollmentResponse> toResponseList(List<Enrollment> entities);
}
