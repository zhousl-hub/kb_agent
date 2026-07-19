package com.kba.knowledge.controller;

import com.kba.common.core.result.R;
import com.kba.knowledge.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 搜索控制器
 *
 * @author kba
 */
@Tag(name = "知识搜索")
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @Operation(summary = "知识检索")
    @GetMapping
    public R<List<Map<String, Object>>> search(
            @RequestParam("query") String query,
            @RequestParam(value = "knowledgeId", required = false) Long knowledgeId,
            @RequestParam(value = "topK", defaultValue = "5") int topK) {
        return R.ok(searchService.search(query, knowledgeId, topK));
    }

    @Operation(summary = "高级检索")
    @PostMapping("/advanced")
    public R<List<Map<String, Object>>> advancedSearch(@RequestBody Map<String, Object> params) {
        return R.ok(searchService.advancedSearch(params));
    }

    @Operation(summary = "搜索建议")
    @GetMapping("/suggestions")
    public R<List<String>> getSuggestions(
            @RequestParam("query") String query,
            @RequestParam(value = "knowledgeId", required = false) Long knowledgeId) {
        return R.ok(searchService.getSuggestions(query, knowledgeId));
    }
}
