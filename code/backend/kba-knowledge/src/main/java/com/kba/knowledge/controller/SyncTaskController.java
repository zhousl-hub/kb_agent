package com.kba.knowledge.controller;

import com.kba.common.core.result.R;
import com.kba.knowledge.service.SyncTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 同步任务控制器
 *
 * @author kba
 */
@Tag(name = "同步任务管理")
@RestController
@RequestMapping("/sync-tasks")
@RequiredArgsConstructor
public class SyncTaskController {

    private final SyncTaskService syncTaskService;

    @Operation(summary = "分页查询同步任务")
    @GetMapping
    public R<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long dataSourceId) {
        return R.ok(syncTaskService.listPage(pageNum, pageSize, dataSourceId));
    }

    @Operation(summary = "获取同步任务详情")
    @GetMapping("/{id}")
    public R<Map<String, Object>> getById(@PathVariable Long id) {
        return R.ok(syncTaskService.getById(id));
    }

    @Operation(summary = "取消同步任务")
    @PostMapping("/{id}/cancel")
    public R<Void> cancel(@PathVariable Long id) {
        syncTaskService.cancel(id);
        return R.ok();
    }
}
