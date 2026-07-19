package com.kba.operations.controller;

import com.kba.operations.dto.MetricResponse;
import com.kba.operations.service.MonitorService;
import com.kba.common.core.result.R;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 监控控制器
 *
 * @author kba
 */
@Tag(name = "系统监控")
@RestController
@RequestMapping("/monitor")
@RequiredArgsConstructor
public class MonitorController {

    private final MonitorService monitorService;

    @Operation(summary = "获取系统概览统计")
    @GetMapping("/dashboard")
    public R<Map<String, Object>> getDashboard() {
        return R.ok(monitorService.getDashboard());
    }

    @Operation(summary = "获取系统指标")
    @GetMapping("/metrics")
    public R<List<MetricResponse>> getMetrics() {
        return R.ok(monitorService.getMetrics());
    }

    @Operation(summary = "获取服务状态")
    @GetMapping("/services")
    public R<List<Map<String, Object>>> getServiceStatus() {
        return R.ok(monitorService.getServiceStatus());
    }

    @Operation(summary = "获取JVM信息")
    @GetMapping("/jvm")
    public R<Map<String, Object>> getJvmInfo() {
        return R.ok(monitorService.getJvmInfo());
    }

    @Operation(summary = "获取内存信息")
    @GetMapping("/memory")
    public R<Map<String, Object>> getMemoryInfo() {
        return R.ok(monitorService.getMemoryInfo());
    }

    @Operation(summary = "获取CPU信息")
    @GetMapping("/cpu")
    public R<Map<String, Object>> getCpuInfo() {
        return R.ok(monitorService.getCpuInfo());
    }

    @Operation(summary = "获取磁盘信息")
    @GetMapping("/disk")
    public R<List<Map<String, Object>>> getDiskInfo() {
        return R.ok(monitorService.getDiskInfo());
    }

    @Operation(summary = "获取在线用户")
    @GetMapping("/online-users")
    public R<Map<String, Object>> getOnlineUsers(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        return R.ok(monitorService.getOnlineUsers(pageNum, pageSize));
    }

    @Operation(summary = "强制下线用户")
    @DeleteMapping("/online-users/{tokenId}")
    public R<Void> forceLogout(@PathVariable String tokenId) {
        monitorService.forceLogout(tokenId);
        return R.ok();
    }
}
