package com.kba.operations.controller;

import com.kba.operations.service.ConfigService;
import com.kba.common.core.result.R;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 配置管理控制器
 *
 * @author kba
 */
@Tag(name = "配置管理")
@RestController
@RequestMapping("/config")
@RequiredArgsConstructor
public class ConfigController {

    private final ConfigService configService;

    @Operation(summary = "获取所有配置")
    @GetMapping
    public R<List<Map<String, Object>>> listConfigs() {
        return R.ok(configService.listConfigs());
    }

    @Operation(summary = "根据分组获取配置")
    @GetMapping("/group/{group}")
    public R<List<Map<String, Object>>> getConfigsByGroup(@PathVariable String group) {
        return R.ok(configService.getConfigsByGroup(group));
    }

    @Operation(summary = "根据键获取配置值")
    @GetMapping("/{key}")
    public R<String> getConfigValue(@PathVariable String key) {
        return R.ok(configService.getConfigValue(key));
    }

    @Operation(summary = "更新配置")
    @PutMapping("/{key}")
    public R<Void> updateConfig(@PathVariable String key, @RequestBody Map<String, Object> config) {
        configService.updateConfig(key, config);
        return R.ok();
    }

    @Operation(summary = "创建配置")
    @PostMapping
    public R<Void> createConfig(@RequestBody Map<String, Object> config) {
        configService.createConfig(config);
        return R.ok();
    }

    @Operation(summary = "删除配置")
    @DeleteMapping("/{key}")
    public R<Void> deleteConfig(@PathVariable String key) {
        configService.deleteConfig(key);
        return R.ok();
    }

    @Operation(summary = "刷新配置缓存")
    @PostMapping("/refresh")
    public R<Void> refreshCache() {
        configService.refreshCache();
        return R.ok();
    }

    @Operation(summary = "获取配置分组列表")
    @GetMapping("/groups")
    public R<List<String>> listGroups() {
        return R.ok(configService.listGroups());
    }
}
