package com.kba.identity.service;

import com.kba.identity.dto.LoginRequest;
import com.kba.identity.dto.LoginResponse;
import com.kba.identity.dto.UserInfoResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    void logout();

    LoginResponse refresh(String token);

    UserInfoResponse getCurrentUserInfo();
}
