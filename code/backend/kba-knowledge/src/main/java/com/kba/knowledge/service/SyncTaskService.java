package com.kba.knowledge.service;

import java.util.Map;

/**
 * 同步任务服务接口
 *
 * @author kba
 */
public interface SyncTaskService {

    Map<String, Object> listPage(int pageNum, int pageSize, Long dataSourceId);

    Map<String, Object> getById(Long id);

    void cancel(Long id);
}
