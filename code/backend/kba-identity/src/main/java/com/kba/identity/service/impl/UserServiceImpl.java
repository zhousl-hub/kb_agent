package com.kba.identity.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.common.core.exception.BusinessException;
import com.kba.common.core.result.PageResult;
import com.kba.identity.dto.UserCreateRequest;
import com.kba.identity.dto.UserInfoResponse;
import com.kba.identity.service.UserService;
import com.kba.identity.entity.SysRole;
import com.kba.identity.entity.SysUser;
import com.kba.identity.mapper.SysRoleMapper;
import com.kba.identity.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final SysUserMapper sysUserMapper;
    private final SysRoleMapper sysRoleMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public PageResult<UserInfoResponse> list(Integer page, Integer size) {
        Page<SysUser> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(SysUser::getCreatedAt);
        Page<SysUser> result = sysUserMapper.selectPage(pageParam, wrapper);

        List<UserInfoResponse> list = result.getRecords().stream()
                .map(this::toUserInfoResponse)
                .toList();

        return PageResult.of(list, result.getTotal(), (int) result.getCurrent(), (int) result.getSize());
    }

    @Override
    @Transactional
    public UserInfoResponse create(UserCreateRequest request) {
        if (existsByUsername(request.getUsername())) {
            throw new BusinessException(409, "用户名已存在");
        }

        if (request.getEmail() != null && existsByEmail(request.getEmail())) {
            throw new BusinessException(409, "邮箱已被使用");
        }

        SysUser user = new SysUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRealName(request.getRealName());
        user.setRoleId(request.getRoleId());
        user.setTenantId(request.getTenantId());
        user.setStatus(1);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        saveUser(user);
        return toUserInfoResponse(user);
    }

    @Override
    @Transactional
    public UserInfoResponse update(Long id, UserCreateRequest request) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        if (!user.getUsername().equals(request.getUsername())
                && existsByUsername(request.getUsername())) {
            throw new BusinessException(409, "用户名已存在");
        }

        if (request.getEmail() != null
                && !request.getEmail().equals(user.getEmail())
                && existsByEmail(request.getEmail())) {
            throw new BusinessException(409, "邮箱已被使用");
        }

        user.setUsername(request.getUsername());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRealName(request.getRealName());
        user.setRoleId(request.getRoleId());
        user.setTenantId(request.getTenantId());
        user.setUpdatedAt(LocalDateTime.now());

        saveUser(user);
        return toUserInfoResponse(user);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        sysUserMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void updateStatus(Long id, Integer status) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        user.setStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        saveUser(user);
    }

    private void saveUser(SysUser user) {
        // 无主键则新增，有主键则更新
        if (user.getId() == null) {
            sysUserMapper.insert(user);
        } else {
            sysUserMapper.updateById(user);
        }
    }

    private boolean existsByUsername(String username) {
        return sysUserMapper.selectCount(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, username)) > 0;
    }

    private boolean existsByEmail(String email) {
        return sysUserMapper.selectCount(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getEmail, email)) > 0;
    }

    private UserInfoResponse toUserInfoResponse(SysUser user) {
        String roleName = null;
        if (user.getRoleId() != null) {
            SysRole role = sysRoleMapper.selectById(user.getRoleId());
            roleName = role != null ? role.getName() : null;
        }
        return UserInfoResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .realName(user.getRealName())
                .status(user.getStatus())
                .roleId(user.getRoleId())
                .roleName(roleName)
                .tenantId(user.getTenantId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
