package com.kba.identity.controller;

import com.kba.common.core.result.R;
import com.kba.identity.dto.LoginRequest;
import com.kba.identity.dto.LoginResponse;
import com.kba.identity.dto.UserInfoResponse;
import com.kba.identity.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "认证管理", description = "登录、登出、令牌刷新等接口")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "用户登录", description = "通过用户名密码登录获取令牌")
    @PostMapping("/login")
    public R<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return R.ok(authService.login(request));
    }

    @Operation(summary = "用户登出", description = "退出登录，注销当前令牌")
    @PostMapping("/logout")
    public R<Void> logout() {
        authService.logout();
        return R.ok();
    }

    @Operation(summary = "刷新令牌", description = "刷新当前令牌，获取新的令牌")
    @PostMapping("/refresh")
    public R<LoginResponse> refresh(@RequestHeader("Authorization") String token) {
        return R.ok(authService.refresh(token));
    }

    @Operation(summary = "获取当前用户信息", description = "获取当前登录用户的详细信息")
    @GetMapping("/user-info")
    public R<UserInfoResponse> userInfo() {
        return R.ok(authService.getCurrentUserInfo());
    }
}
