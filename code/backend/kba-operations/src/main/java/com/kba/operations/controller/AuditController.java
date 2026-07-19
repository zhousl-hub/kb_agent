package com.kba.operations.controller;

import com.kba.operations.dto.AuditLogCreateRequest;
import com.kba.operations.dto.AuditLogResponse;
import com.kba.operations.service.AuditService;
import com.kba.common.core.result.R;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 审计日志控制器
 *
 * @author kba
 */
@Tag(name = "审计日志")
@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @Operation(summary = "分页查询审计日志")
    @GetMapping("/logs")
    public R<Map<String, Object>> listLogs(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        return R.ok(auditService.listLogs(pageNum, pageSize, module, action, userId, startTime, endTime));
    }

    @Operation(summary = "获取审计日志详情")
    @GetMapping("/logs/{id}")
    public R<AuditLogResponse> getLogById(@PathVariable Long id) {
        return R.ok(auditService.getLogById(id));
    }

    @Operation(summary = "创建审计日志")
    @PostMapping("/logs")
    public R<Void> createLog(@RequestBody AuditLogCreateRequest request) {
        auditService.createLog(request);
        return R.ok();
    }

    @Operation(summary = "获取审计日志模块列表")
    @GetMapping("/modules")
    public R<List<String>> listModules() {
        return R.ok(auditService.listModules());
    }

    @Operation(summary = "获取审计日志操作类型列表")
    @GetMapping("/actions")
    public R<List<String>> listActions() {
        return R.ok(auditService.listActions());
    }

    @Operation(summary = "导出审计日志")
    @GetMapping("/logs/export")
    public R<String> exportLogs(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        return R.ok(auditService.exportLogs(module, action, userId, startTime, endTime));
    }
}
