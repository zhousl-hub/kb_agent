package com.kba.ai.controller;

import com.kba.ai.service.AssistantService;
import com.kba.common.core.result.R;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 助手控制器
 *
 * @author kba
 */
@Tag(name = "助手管理")
@RestController
@RequestMapping("/assistants")
@RequiredArgsConstructor
public class AssistantController {

    private final AssistantService assistantService;

    @Operation(summary = "获取助手列表")
    @GetMapping
    public R<Map<String, Object>> list(
            @RequestParam(value = "pageNum", defaultValue = "1") int pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "status", required = false) String status) {
        return R.ok(assistantService.listPage(pageNum, pageSize, status));
    }

    @Operation(summary = "获取助手详情")
    @GetMapping("/{id}")
    public R<Map<String, Object>> getById(@PathVariable Long id) {
        return R.ok(assistantService.getById(id));
    }

    @Operation(summary = "创建助手")
    @PostMapping
    public R<Map<String, Object>> create(@RequestBody Map<String, Object> request) {
        return R.ok(assistantService.create(request));
    }

    @Operation(summary = "更新助手")
    @PutMapping("/{id}")
    public R<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        return R.ok(assistantService.update(id, request));
    }

    @Operation(summary = "删除助手")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        assistantService.delete(id);
        return R.ok();
    }
}
