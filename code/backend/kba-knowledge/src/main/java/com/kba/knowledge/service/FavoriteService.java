package com.kba.knowledge.service;

import java.util.List;
import java.util.Map;

/**
 * 收藏服务
 */
public interface FavoriteService {

    List<Map<String, Object>> listByCurrentUser(String search);

    void delete(Long id);
}
