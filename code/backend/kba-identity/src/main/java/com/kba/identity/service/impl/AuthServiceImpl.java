package com.kba.identity.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.kba.common.core.exception.BusinessException;
import com.kba.identity.dto.LoginRequest;
import com.kba.identity.dto.LoginResponse;
import com.kba.identity.dto.UserInfoResponse;
import com.kba.identity.service.AuthService;
import com.kba.identity.entity.SysUser;
import com.kba.identity.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final SysUserMapper sysUserMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public LoginResponse login(LoginRequest request) {
        // 根据用户名查询用户
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, request.getUsername()));
        if (user == null) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new BusinessException(403, "账号已被禁用");
        }

        StpUtil.login(user.getId());
        String token = StpUtil.getTokenValue();

        user.setUpdatedAt(LocalDateTime.now());
        // 保存用户信息：无主键则新增，有主键则更新
        if (user.getId() == null) {
            sysUserMapper.insert(user);
        } else {
            sysUserMapper.updateById(user);
        }

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(UserInfoResponse.from(user))
                .build();
    }

    @Override
    public void logout() {
        StpUtil.logout();
    }

    @Override
    public LoginResponse refresh(String token) {
        Long userId = StpUtil.getLoginIdAsLong();
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        StpUtil.logout();
        StpUtil.login(user.getId());
        String newToken = StpUtil.getTokenValue();

        return LoginResponse.builder()
                .token(newToken)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(UserInfoResponse.from(user))
                .build();
    }

    @Override
    public UserInfoResponse getCurrentUserInfo() {
        Long userId = StpUtil.getLoginIdAsLong();
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return UserInfoResponse.from(user);
    }
}
