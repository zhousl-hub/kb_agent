package com.kba.knowledge.controller;

import com.kba.common.core.result.R;
import com.kba.knowledge.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 文档控制器
 *
 * @author kba
 */
@Tag(name = "文档管理")
@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @Operation(summary = "最近访问文档")
    @GetMapping("/recent")
    public R<List<Map<String, Object>>> recent(
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        return R.ok(documentService.listRecent(limit));
    }

    @Operation(summary = "分页查询文档")
    @GetMapping
    public R<Map<String, Object>> list(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "pageSize", defaultValue = "20") int pageSize,
            @RequestParam(value = "knowledgeId", required = false) Long knowledgeId) {
        return R.ok(documentService.listPage(page, pageSize, knowledgeId));
    }

    @Operation(summary = "获取文档详情")
    @GetMapping("/{id}")
    public R<Map<String, Object>> getById(@PathVariable Long id) {
        return R.ok(documentService.getById(id));
    }

    @Operation(summary = "删除文档")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        documentService.delete(id);
        return R.ok();
    }

    @Operation(summary = "上传文档")
    @PostMapping("/upload")
    public R<Map<String, Object>> upload(
            @RequestParam(value = "knowledgeId") Long knowledgeId,
            @RequestParam("file") MultipartFile file) {
        return R.ok(documentService.upload(knowledgeId, file));
    }

    @Operation(summary = "处理文档")
    @PostMapping("/{id}/process")
    public R<Void> process(@PathVariable Long id) {
        documentService.process(id);
        return R.ok();
    }
}
