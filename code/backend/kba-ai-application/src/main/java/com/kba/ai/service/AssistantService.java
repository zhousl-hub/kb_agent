package com.kba.ai.service;

import java.util.Map;

/**
 * 助手服务接口
 *
 * @author kba
 */
public interface AssistantService {

    Map<String, Object> listPage(int pageNum, int pageSize, String status);

    Map<String, Object> getById(Long id);

    Map<String, Object> create(Map<String, Object> request);

    Map<String, Object> update(Long id, Map<String, Object> request);

    void delete(Long id);
}
