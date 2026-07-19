package com.kba.knowledge.controller;

import com.kba.common.core.result.R;
import com.kba.knowledge.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 收藏控制器
 */
@Tag(name = "收藏管理")
@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @Operation(summary = "获取当前用户收藏列表")
    @GetMapping
    public R<List<Map<String, Object>>> list(
            @RequestParam(value = "search", required = false) String search) {
        return R.ok(favoriteService.listByCurrentUser(search));
    }

    @Operation(summary = "取消收藏")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        favoriteService.delete(id);
        return R.ok();
    }
}
