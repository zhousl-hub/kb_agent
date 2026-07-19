package com.kba.ai.controller;

import com.kba.ai.entity.ModelRouter;
import com.kba.ai.service.ModelRouterService;
import com.kba.common.core.result.R;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 模型路由控制器
 *
 * @author kba
 */
@Tag(name = "模型路由管理")
@RestController
@RequestMapping("/model-routers")
@RequiredArgsConstructor
public class ModelRouterController {

    private final ModelRouterService modelRouterService;

    @Operation(summary = "分页查询模型路由")
    @GetMapping
    public R<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        return R.ok(modelRouterService.listPage(pageNum, pageSize, keyword, status));
    }

    @Operation(summary = "获取所有模型路由")
    @GetMapping("/all")
    public R<List<ModelRouter>> listAll() {
        return R.ok(modelRouterService.listAll());
    }

    @Operation(summary = "获取模型路由详情")
    @GetMapping("/{id}")
    public R<ModelRouter> getById(@PathVariable Long id) {
        return R.ok(modelRouterService.getById(id));
    }

    @Operation(summary = "创建模型路由")
    @PostMapping
    public R<ModelRouter> create(@RequestBody ModelRouter router) {
        return R.ok(modelRouterService.create(router));
    }

    @Operation(summary = "更新模型路由")
    @PutMapping("/{id}")
    public R<ModelRouter> update(@PathVariable Long id, @RequestBody ModelRouter router) {
        return R.ok(modelRouterService.update(id, router));
    }

    @Operation(summary = "删除模型路由")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        modelRouterService.delete(id);
        return R.ok();
    }

    @Operation(summary = "更新模型路由状态")
    @PatchMapping("/{id}/status")
    public R<Void> updateStatus(@PathVariable Long id, @RequestParam String status) {
        modelRouterService.updateStatus(id, status);
        return R.ok();
    }

    @Operation(summary = "更新模型路由优先级")
    @PatchMapping("/{id}/priority")
    public R<Void> updatePriority(@PathVariable Long id, @RequestParam Integer priority) {
        modelRouterService.updatePriority(id, priority);
        return R.ok();
    }

    @Operation(summary = "测试模型路由")
    @PostMapping("/{id}/test")
    public R<Map<String, Object>> testRoute(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        return R.ok(modelRouterService.testRoute(id, prompt));
    }
}
