package com.kba.ai.service;

import java.util.Map;

/**
 * 应用服务接口
 *
 * @author kba
 */
public interface AppService {

    Map<String, Object> listPage(int pageNum, int pageSize, String type, String status);

    Map<String, Object> getById(Long id);

    Map<String, Object> create(Map<String, Object> request);

    Map<String, Object> update(Long id, Map<String, Object> request);

    void delete(Long id);

    void publish(Long id);
}
