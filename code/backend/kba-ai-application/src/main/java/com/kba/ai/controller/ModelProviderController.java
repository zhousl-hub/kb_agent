package com.kba.ai.controller;

import com.kba.ai.entity.ModelProvider;
import com.kba.ai.service.ModelProviderService;
import com.kba.common.core.result.R;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 模型供应商控制器
 *
 * @author kba
 */
@Tag(name = "模型供应商管理")
@RestController
@RequestMapping("/model-providers")
@RequiredArgsConstructor
public class ModelProviderController {

    private final ModelProviderService modelProviderService;

    @Operation(summary = "分页查询模型供应商")
    @GetMapping
    public R<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type) {
        return R.ok(modelProviderService.listPage(pageNum, pageSize, keyword, type));
    }

    @Operation(summary = "获取所有模型供应商")
    @GetMapping("/all")
    public R<List<ModelProvider>> listAll() {
        return R.ok(modelProviderService.listAll());
    }

    @Operation(summary = "获取模型供应商详情")
    @GetMapping("/{id}")
    public R<ModelProvider> getById(@PathVariable Long id) {
        return R.ok(modelProviderService.getById(id));
    }

    @Operation(summary = "创建模型供应商")
    @PostMapping
    public R<ModelProvider> create(@RequestBody ModelProvider provider) {
        return R.ok(modelProviderService.create(provider));
    }

    @Operation(summary = "更新模型供应商")
    @PutMapping("/{id}")
    public R<ModelProvider> update(@PathVariable Long id, @RequestBody ModelProvider provider) {
        return R.ok(modelProviderService.update(id, provider));
    }

    @Operation(summary = "删除模型供应商")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        modelProviderService.delete(id);
        return R.ok();
    }

    @Operation(summary = "测试模型供应商连接")
    @PostMapping("/{id}/test")
    public R<Map<String, Object>> testConnection(@PathVariable Long id) {
        boolean success = modelProviderService.testConnection(id);
        return R.ok(Map.of("success", success, "message", success ? "连接成功" : "连接失败"));
    }

    @Operation(summary = "获取供应商支持的模型列表")
    @GetMapping("/{id}/models")
    public R<List<Map<String, Object>>> getModels(@PathVariable Long id) {
        return R.ok(modelProviderService.getModels(id));
    }

    @Operation(summary = "获取支持的供应商类型")
    @GetMapping("/supported-types")
    public R<List<Map<String, Object>>> getSupportedTypes() {
        return R.ok(modelProviderService.getSupportedTypes());
    }
}
