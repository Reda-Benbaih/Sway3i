package enaa.sway3i.mapper;

import enaa.sway3i.dto.request.StudentRequest;
import enaa.sway3i.dto.response.StudentResponse;
import enaa.sway3i.model.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface StudentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Student toEntity(StudentRequest request);

    StudentResponse toResponse(Student entity);

    List<StudentResponse> toResponseList(List<Student> entities);
}
