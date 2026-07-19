package com.kba.identity.service;

import com.kba.identity.dto.UserCreateRequest;
import com.kba.identity.dto.UserInfoResponse;
import com.kba.common.core.result.PageResult;

public interface UserService {

    PageResult<UserInfoResponse> list(Integer page, Integer size);

    UserInfoResponse create(UserCreateRequest request);

    UserInfoResponse update(Long id, UserCreateRequest request);

    void delete(Long id);

    void updateStatus(Long id, Integer status);
}
