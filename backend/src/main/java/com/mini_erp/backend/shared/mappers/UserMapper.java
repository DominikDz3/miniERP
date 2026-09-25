package com.mini_erp.backend.shared.mappers;

import com.mini_erp.backend.auth.domain.User;
import com.mini_erp.backend.auth.web.dto.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roleName", source = "role.name")
    UserResponse toResponse(User user);
}