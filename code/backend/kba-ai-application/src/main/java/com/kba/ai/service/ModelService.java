package com.kba.ai.service;

import java.util.Map;

/**
 * 模型服务接口
 *
 * @author kba
 */
public interface ModelService {

    Map<String, Object> listPage(int pageNum, int pageSize, String provider);

    Map<String, Object> getById(Long id);

    Map<String, Object> create(Map<String, Object> request);

    Map<String, Object> update(Long id, Map<String, Object> request);

    void delete(Long id);

    Map<String, Object> getStats(Long id);
}
