package com.kba.knowledge.controller;

import com.kba.common.core.result.PageResult;
import com.kba.common.core.result.R;
import com.kba.knowledge.entity.Report;
import com.kba.knowledge.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 报告控制器
 *
 * @author kba
 */
@Tag(name = "报告管理")
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "分页查询报告")
    @GetMapping
    public R<PageResult<Report>> list(
            @RequestParam(value = "pageNum", defaultValue = "1") int pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) String status) {
        return R.ok(reportService.listPage(pageNum, pageSize, keyword, status));
    }

    @Operation(summary = "获取报告详情")
    @GetMapping("/{id}")
    public R<Report> getById(@PathVariable Long id) {
        return R.ok(reportService.getById(id));
    }

    @Operation(summary = "创建报告")
    @PostMapping
    public R<Report> create(@RequestBody Report report) {
        return R.ok(reportService.create(report));
    }

    @Operation(summary = "更新报告")
    @PutMapping("/{id}")
    public R<Report> update(@PathVariable Long id, @RequestBody Report report) {
        return R.ok(reportService.update(id, report));
    }

    @Operation(summary = "删除报告")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        reportService.delete(id);
        return R.ok();
    }

    @Operation(summary = "发布报告")
    @PostMapping("/{id}/publish")
    public R<Report> publish(@PathVariable Long id) {
        return R.ok(reportService.publish(id));
    }

    @Operation(summary = "检索知识库")
    @PostMapping("/search")
    public R<List<?>> search(@RequestBody Map<String, Object> body) {
        return R.ok(reportService.search(body));
    }
}
