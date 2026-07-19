package com.kba.identity.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.kba.identity.entity.SysRole;
import com.kba.identity.entity.SysRolePermission;
import com.kba.identity.mapper.SysRoleMapper;
import com.kba.identity.mapper.SysRolePermissionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final SysRoleMapper sysRoleMapper;
    private final SysRolePermissionMapper sysRolePermissionMapper;

    public List<SysRole> list() {
        return sysRoleMapper.selectList(null);
    }

    public SysRole create(SysRole role) {
        if (role.getId() == null) {
            sysRoleMapper.insert(role);
        } else {
            sysRoleMapper.updateById(role);
        }
        return role;
    }

    public SysRole update(Long id, SysRole role) {
        role.setId(id);
        if (role.getId() == null) {
            sysRoleMapper.insert(role);
        } else {
            sysRoleMapper.updateById(role);
        }
        return role;
    }

    public void delete(Long id) {
        sysRoleMapper.deleteById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updatePermissions(Long id, List<Long> permissionIds) {
        // 先删除该角色已有的权限关联，再重新写入新的权限关联
        LambdaQueryWrapper<SysRolePermission> deleteWrapper = new LambdaQueryWrapper<>();
        deleteWrapper.eq(SysRolePermission::getRoleId, id);
        sysRolePermissionMapper.delete(deleteWrapper);

        for (Long permissionId : permissionIds) {
            SysRolePermission rolePermission = new SysRolePermission();
            rolePermission.setRoleId(id);
            rolePermission.setPermissionId(permissionId);
            sysRolePermissionMapper.insert(rolePermission);
        }
    }
}
