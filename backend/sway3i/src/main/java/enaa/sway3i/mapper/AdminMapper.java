package enaa.sway3i.mapper;

import enaa.sway3i.dto.request.AdminRequest;
import enaa.sway3i.dto.response.AdminResponse;
import enaa.sway3i.model.Admin;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AdminMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Admin toEntity(AdminRequest request);

    AdminResponse toResponse(Admin entity);

    List<AdminResponse> toResponseList(List<Admin> entities);
}
