package com.kba.ai.controller;

import com.kba.ai.service.ModelService;
import com.kba.common.core.result.R;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 模型控制器
 *
 * @author kba
 */
@Tag(name = "模型管理")
@RestController
@RequestMapping("/models")
@RequiredArgsConstructor
public class ModelController {

    private final ModelService modelService;

    @Operation(summary = "分页查询模型")
    @GetMapping
    public R<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String provider) {
        return R.ok(modelService.listPage(pageNum, pageSize, provider));
    }

    @Operation(summary = "获取模型详情")
    @GetMapping("/{id}")
    public R<Map<String, Object>> getById(@PathVariable Long id) {
        return R.ok(modelService.getById(id));
    }

    @Operation(summary = "创建模型")
    @PostMapping
    public R<Map<String, Object>> create(@RequestBody Map<String, Object> request) {
        return R.ok(modelService.create(request));
    }

    @Operation(summary = "更新模型")
    @PutMapping("/{id}")
    public R<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        return R.ok(modelService.update(id, request));
    }

    @Operation(summary = "删除模型")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        modelService.delete(id);
        return R.ok();
    }

    @Operation(summary = "获取模型统计")
    @GetMapping("/{id}/stats")
    public R<Map<String, Object>> getStats(@PathVariable Long id) {
        return R.ok(modelService.getStats(id));
    }
}
