package com.kba.ai.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.ai.entity.ModelProvider;
import com.kba.ai.mapper.ModelProviderMapper;
import com.kba.ai.service.ModelProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 模型供应商服务实现
 *
 * @author kba
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ModelProviderServiceImpl implements ModelProviderService {

    private final ModelProviderMapper modelProviderMapper;

    @Override
    public Map<String, Object> listPage(int pageNum, int pageSize, String keyword, String type) {
        LambdaQueryWrapper<ModelProvider> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(ModelProvider::getName, keyword);
        }
        if (type != null && !type.isEmpty()) {
            wrapper.eq(ModelProvider::getType, type);
        }
        wrapper.orderByDesc(ModelProvider::getCreatedAt);
        Page<ModelProvider> page = modelProviderMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        Map<String, Object> result = new HashMap<>();
        result.put("records", page.getRecords());
        result.put("total", page.getTotal());
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        return result;
    }

    @Override
    public List<ModelProvider> listAll() {
        return modelProviderMapper.selectList(
                new LambdaQueryWrapper<ModelProvider>()
                        .eq(ModelProvider::getStatus, "active")
                        .orderByAsc(ModelProvider::getName)
        );
    }

    @Override
    public ModelProvider getById(Long id) {
        return modelProviderMapper.selectById(id);
    }

    @Override
    public ModelProvider create(ModelProvider provider) {
        provider.setStatus("active");
        provider.setCreatedBy(StpUtil.getLoginIdAsLong());
        modelProviderMapper.insert(provider);
        return provider;
    }

    @Override
    public ModelProvider update(Long id, ModelProvider provider) {
        provider.setId(id);
        modelProviderMapper.updateById(provider);
        return provider;
    }

    @Override
    public void delete(Long id) {
        modelProviderMapper.deleteById(id);
    }

    @Override
    public boolean testConnection(Long id) {
        ModelProvider provider = modelProviderMapper.selectById(id);
        if (provider == null) {
            return false;
        }
        return true;
    }

    @Override
    public List<Map<String, Object>> getModels(Long id) {
        return List.of();
    }

    @Override
    public List<Map<String, Object>> getSupportedTypes() {
        return List.of(
                Map.of("code", "openai", "name", "OpenAI"),
                Map.of("code", "azure", "name", "Azure OpenAI"),
                Map.of("code", "anthropic", "name", "Anthropic"),
                Map.of("code", "tongyi", "name", "通义千问"),
                Map.of("code", "wenxin", "name", "文心一言"),
                Map.of("code", "zhipu", "name", "智谱AI"),
                Map.of("code", "ollama", "name", "Ollama"),
                Map.of("code", "xinference", "name", "Xinference")
        );
    }
}
