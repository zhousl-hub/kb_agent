package com.kba.ai.controller;

import com.kba.ai.service.AppService;
import com.kba.common.core.result.R;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 应用控制器
 *
 * @author kba
 */
@Tag(name = "AI应用管理")
@RestController
@RequestMapping("/apps")
@RequiredArgsConstructor
public class AppController {

    private final AppService appService;

    @Operation(summary = "分页查询应用")
    @GetMapping
    public R<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {
        return R.ok(appService.listPage(pageNum, pageSize, type, status));
    }

    @Operation(summary = "获取应用详情")
    @GetMapping("/{id}")
    public R<Map<String, Object>> getById(@PathVariable Long id) {
        return R.ok(appService.getById(id));
    }

    @Operation(summary = "创建应用")
    @PostMapping
    public R<Map<String, Object>> create(@RequestBody Map<String, Object> request) {
        return R.ok(appService.create(request));
    }

    @Operation(summary = "更新应用")
    @PutMapping("/{id}")
    public R<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        return R.ok(appService.update(id, request));
    }

    @Operation(summary = "删除应用")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        appService.delete(id);
        return R.ok();
    }

    @Operation(summary = "发布应用")
    @PostMapping("/{id}/publish")
    public R<Void> publish(@PathVariable Long id) {
        appService.publish(id);
        return R.ok();
    }
}
