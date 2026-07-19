package com.kba.knowledge.service;

import java.util.Map;

/**
 * 数据源服务接口
 *
 * @author kba
 */
public interface DataSourceService {

    Map<String, Object> listPage(int pageNum, int pageSize, Long knowledgeId);

    Map<String, Object> getById(Long id);

    Map<String, Object> create(Map<String, Object> request);

    Map<String, Object> update(Long id, Map<String, Object> request);

    void delete(Long id);

    void sync(Long id);
}
