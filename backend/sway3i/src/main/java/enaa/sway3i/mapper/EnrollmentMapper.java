package enaa.sway3i.mapper;

import enaa.sway3i.dto.request.EnrollmentRequest;
import enaa.sway3i.dto.response.EnrollmentResponse;
import enaa.sway3i.model.Enrollment;
import enaa.sway3i.model.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "requestedAt", ignore = true)
    @Mapping(target = "monthlyPrice", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "courseListing", ignore = true)
    Enrollment toEntity(EnrollmentRequest request);

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", source = "student", qualifiedByName = "studentFullName")
    @Mapping(target = "courseListingId", source = "courseListing.id")
    @Mapping(target = "courseTitle", source = "courseListing.title")
    EnrollmentResponse toResponse(Enrollment entity);

    List<EnrollmentResponse> toResponseList(List<Enrollment> entities);

    @Named("studentFullName")
    default String studentFullName(Student student) {
        if (student == null) {
            return null;
        }
        String first = student.getFirstName() == null ? "" : student.getFirstName();
        String last = student.getLastName() == null ? "" : student.getLastName();
        return (first + " " + last).trim();
    }
}
