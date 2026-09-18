package enaa.sway3i.mapper;

import enaa.sway3i.dto.request.SessionRequest;
import enaa.sway3i.dto.response.SessionResponse;
import enaa.sway3i.model.Session;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SessionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "courseListing", ignore = true)
    Session toEntity(SessionRequest request);

    @Mapping(target = "courseListingId", source = "courseListing.id")
    SessionResponse toResponse(Session entity);

    List<SessionResponse> toResponseList(List<Session> entities);
}
