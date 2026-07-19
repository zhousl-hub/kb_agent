package com.kba.knowledge.service;

import java.util.List;
import java.util.Map;

/**
 * 搜索服务接口
 *
 * @author kba
 */
public interface SearchService {

    List<Map<String, Object>> search(String query, Long knowledgeId, int topK);

    List<Map<String, Object>> advancedSearch(Map<String, Object> params);

    List<String> getSuggestions(String query, Long knowledgeId);
}
