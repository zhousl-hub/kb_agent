package com.kba.identity.controller;

import com.kba.common.core.result.R;
import com.kba.identity.service.UserTodoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 用户工作台接口（待办等）
 */
@Tag(name = "用户工作台")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserWorkspaceController {

    private final UserTodoService userTodoService;

    @Operation(summary = "获取待办列表")
    @GetMapping("/todos")
    public R<List<Map<String, Object>>> listTodos() {
        return R.ok(userTodoService.listByCurrentUser());
    }

    @Operation(summary = "创建待办")
    @PostMapping("/todos")
    public R<Map<String, Object>> createTodo(@RequestBody Map<String, Object> request) {
        String content = request.get("content") != null ? request.get("content").toString() : null;
        return R.ok(userTodoService.create(content));
    }

    @Operation(summary = "切换待办完成状态")
    @PostMapping("/todos/{id}/toggle")
    public R<Void> toggleTodo(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> request) {
        boolean completed = request != null && Boolean.TRUE.equals(request.get("completed"));
        userTodoService.toggle(id, completed);
        return R.ok();
    }

    @Operation(summary = "删除待办")
    @PostMapping("/todos/{id}/delete")
    public R<Void> deleteTodo(@PathVariable Long id) {
        userTodoService.delete(id);
        return R.ok();
    }
}
