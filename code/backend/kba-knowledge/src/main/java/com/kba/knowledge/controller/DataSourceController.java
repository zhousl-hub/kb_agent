package com.kba.knowledge.controller;

import com.kba.common.core.result.R;
import com.kba.knowledge.service.DataSourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 数据源控制器
 *
 * @author kba
 */
@Tag(name = "数据源管理")
@RestController
@RequestMapping("/data-sources")
@RequiredArgsConstructor
public class DataSourceController {

    private final DataSourceService dataSourceService;

    @Operation(summary = "分页查询数据源")
    @GetMapping
    public R<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long knowledgeId) {
        return R.ok(dataSourceService.listPage(pageNum, pageSize, knowledgeId));
    }

    @Operation(summary = "获取数据源详情")
    @GetMapping("/{id}")
    public R<Map<String, Object>> getById(@PathVariable Long id) {
        return R.ok(dataSourceService.getById(id));
    }

    @Operation(summary = "创建数据源")
    @PostMapping
    public R<Map<String, Object>> create(@RequestBody Map<String, Object> request) {
        return R.ok(dataSourceService.create(request));
    }

    @Operation(summary = "更新数据源")
    @PutMapping("/{id}")
    public R<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        return R.ok(dataSourceService.update(id, request));
    }

    @Operation(summary = "删除数据源")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        dataSourceService.delete(id);
        return R.ok();
    }

    @Operation(summary = "同步数据源")
    @PostMapping("/{id}/sync")
    public R<Void> sync(@PathVariable Long id) {
        dataSourceService.sync(id);
        return R.ok();
    }
}
