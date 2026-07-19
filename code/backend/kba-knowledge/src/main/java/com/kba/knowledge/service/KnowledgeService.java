package com.kba.knowledge.service;

import java.util.Map;

/**
 * 知识库服务接口
 *
 * @author kba
 */
public interface KnowledgeService {

    Map<String, Object> listPage(int pageNum, int pageSize, Long spaceId);

    Map<String, Object> getById(Long id);

    Map<String, Object> create(Map<String, Object> request);

    Map<String, Object> update(Long id, Map<String, Object> request);

    void delete(Long id);

    Map<String, Object> getStats();
}
