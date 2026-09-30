package enaa.sway3i.mapper;

import enaa.sway3i.dto.request.TutorRequest;
import enaa.sway3i.dto.response.TutorResponse;
import enaa.sway3i.model.Tutor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = SubjectMapper.class)
public interface TutorMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isVerified", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "subjects", ignore = true)
    Tutor toEntity(TutorRequest request);

    @Mapping(target = "reviewCount", ignore = true)
    TutorResponse toResponse(Tutor entity);

    List<TutorResponse> toResponseList(List<Tutor> entities);
}
