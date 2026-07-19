package com.kba.knowledge.controller;

import com.kba.common.core.result.R;
import com.kba.knowledge.service.KnowledgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 知识库控制器
 *
 * @author kba
 */
@Tag(name = "知识库管理")
@RestController
@RequestMapping("/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    @Operation(summary = "分页查询知识库")
    @GetMapping
    public R<Map<String, Object>> list(
            @RequestParam(value = "pageNum", defaultValue = "1") int pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "spaceId", required = false) Long spaceId) {
        return R.ok(knowledgeService.listPage(pageNum, pageSize, spaceId));
    }

    @Operation(summary = "获取知识库详情")
    @GetMapping("/{id}")
    public R<Map<String, Object>> getById(@PathVariable Long id) {
        return R.ok(knowledgeService.getById(id));
    }

    @Operation(summary = "创建知识库")
    @PostMapping
    public R<Map<String, Object>> create(@RequestBody Map<String, Object> request) {
        return R.ok(knowledgeService.create(request));
    }

    @Operation(summary = "更新知识库")
    @PutMapping("/{id}")
    public R<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        return R.ok(knowledgeService.update(id, request));
    }

    @Operation(summary = "删除知识库")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        knowledgeService.delete(id);
        return R.ok();
    }

    @Operation(summary = "知识统计数据")
    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        return R.ok(knowledgeService.getStats());
    }
}
