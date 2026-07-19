package com.kba.ai.service;

import com.kba.ai.entity.ModelRouter;

import java.util.List;
import java.util.Map;

/**
 * 模型路由服务接口
 *
 * @author kba
 */
public interface ModelRouterService {

    Map<String, Object> listPage(int pageNum, int pageSize, String keyword, String status);

    List<ModelRouter> listAll();

    ModelRouter getById(Long id);

    ModelRouter create(ModelRouter router);

    ModelRouter update(Long id, ModelRouter router);

    void delete(Long id);

    void updateStatus(Long id, String status);

    void updatePriority(Long id, Integer priority);

    Map<String, Object> testRoute(Long id, String prompt);
}
