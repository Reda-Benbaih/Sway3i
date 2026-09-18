package enaa.sway3i.mapper;

import enaa.sway3i.dto.request.SubjectRequest;
import enaa.sway3i.dto.response.SubjectResponse;
import enaa.sway3i.model.Subject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SubjectMapper {

    @Mapping(target = "id", ignore = true)
    Subject toEntity(SubjectRequest request);

    SubjectResponse toResponse(Subject entity);

    List<SubjectResponse> toResponseList(List<Subject> entities);
}
