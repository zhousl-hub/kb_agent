package com.kba.identity.controller;

import com.kba.identity.service.RoleService;
import com.kba.identity.entity.SysRole;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public List<SysRole> list() {
        return roleService.list();
    }

    @PostMapping
    public SysRole create(@RequestBody SysRole role) {
        return roleService.create(role);
    }

    @PutMapping("/{id}")
    public SysRole update(@PathVariable Long id, @RequestBody SysRole role) {
        return roleService.update(id, role);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        roleService.delete(id);
    }

    @PutMapping("/{id}/permissions")
    public void updatePermissions(@PathVariable Long id, @RequestBody List<Long> permissionIds) {
        roleService.updatePermissions(id, permissionIds);
    }
}
