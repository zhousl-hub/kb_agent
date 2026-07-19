package com.kba.ai.service;

import com.kba.ai.entity.ModelProvider;

import java.util.List;
import java.util.Map;

/**
 * 模型供应商服务接口
 *
 * @author kba
 */
public interface ModelProviderService {

    Map<String, Object> listPage(int pageNum, int pageSize, String keyword, String type);

    List<ModelProvider> listAll();

    ModelProvider getById(Long id);

    ModelProvider create(ModelProvider provider);

    ModelProvider update(Long id, ModelProvider provider);

    void delete(Long id);

    boolean testConnection(Long id);

    List<Map<String, Object>> getModels(Long id);

    List<Map<String, Object>> getSupportedTypes();
}
