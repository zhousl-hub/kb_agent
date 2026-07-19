package com.kba.knowledge.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.kba.common.core.exception.BusinessException;
import com.kba.knowledge.service.FavoriteService;
import com.kba.knowledge.entity.Favorite;
import com.kba.knowledge.mapper.FavoriteMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteMapper favoriteMapper;

    @Override
    public List<Map<String, Object>> listByCurrentUser(String search) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Favorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Favorite::getUserId, userId)
                .orderByDesc(Favorite::getCreatedAt);
        if (StringUtils.hasText(search)) {
            wrapper.and(w -> w.like(Favorite::getDocumentName, search)
                    .or()
                    .like(Favorite::getKnowledgeName, search)
                    .or()
                    .like(Favorite::getContent, search));
        }
        return favoriteMapper.selectList(wrapper).stream()
                .map(this::toMap)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Favorite favorite = favoriteMapper.selectById(id);
        if (favorite == null || !userId.equals(favorite.getUserId())) {
            throw new BusinessException(404, "收藏不存在");
        }
        favoriteMapper.deleteById(id);
    }

    private Map<String, Object> toMap(Favorite favorite) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", String.valueOf(favorite.getId()));
        map.put("knowledgeId", favorite.getKnowledgeId() != null ? String.valueOf(favorite.getKnowledgeId()) : "");
        map.put("knowledgeTitle", favorite.getDocumentName());
        map.put("knowledgeType", resolveType(favorite.getDocumentName()));
        map.put("summary", StringUtils.hasText(favorite.getContent())
                ? favorite.getContent()
                : favorite.getDocumentName());
        map.put("source", favorite.getKnowledgeName());
        map.put("createdAt", favorite.getCreatedAt());
        return map;
    }

    private String resolveType(String documentName) {
        if (!StringUtils.hasText(documentName) || !documentName.contains(".")) {
            return "document";
        }
        return documentName.substring(documentName.lastIndexOf('.') + 1).toLowerCase();
    }
}
