package com.kba.identity.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.kba.common.core.exception.BusinessException;
import com.kba.identity.service.UserTodoService;
import com.kba.identity.entity.SysUserTodo;
import com.kba.identity.mapper.SysUserTodoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserTodoServiceImpl implements UserTodoService {

    private final SysUserTodoMapper userTodoMapper;

    @Override
    public List<Map<String, Object>> listByCurrentUser() {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<SysUserTodo> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUserTodo::getUserId, userId)
                .orderByDesc(SysUserTodo::getCreatedAt);
        return userTodoMapper.selectList(wrapper).stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> create(String content) {
        if (!StringUtils.hasText(content)) {
            throw new BusinessException(400, "待办内容不能为空");
        }
        Long userId = StpUtil.getLoginIdAsLong();
        SysUserTodo todo = new SysUserTodo();
        todo.setUserId(userId);
        todo.setTenantId(1L);
        todo.setContent(content.trim());
        todo.setCompleted(0);
        todo.setCreatedAt(LocalDateTime.now());
        todo.setUpdatedAt(LocalDateTime.now());
        userTodoMapper.insert(todo);
        return toMap(todo);
    }

    @Override
    public void toggle(Long id, boolean completed) {
        SysUserTodo todo = getOwnedTodo(id);
        todo.setCompleted(completed ? 1 : 0);
        todo.setUpdatedAt(LocalDateTime.now());
        userTodoMapper.updateById(todo);
    }

    @Override
    public void delete(Long id) {
        SysUserTodo todo = getOwnedTodo(id);
        userTodoMapper.deleteById(todo.getId());
    }

    private SysUserTodo getOwnedTodo(Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        SysUserTodo todo = userTodoMapper.selectById(id);
        if (todo == null || !userId.equals(todo.getUserId())) {
            throw new BusinessException(404, "待办不存在");
        }
        return todo;
    }

    private Map<String, Object> toMap(SysUserTodo todo) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", String.valueOf(todo.getId()));
        map.put("content", todo.getContent());
        map.put("completed", todo.getCompleted() != null && todo.getCompleted() == 1);
        map.put("createdAt", todo.getCreatedAt());
        return map;
    }
}
