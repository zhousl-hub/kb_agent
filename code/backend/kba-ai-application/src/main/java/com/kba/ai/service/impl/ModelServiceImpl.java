package com.kba.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.ai.entity.LLMModel;
import com.kba.ai.mapper.LLMModelMapper;
import com.kba.ai.service.ModelService;
import com.kba.common.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ModelServiceImpl implements ModelService {

    private final LLMModelMapper llmModelMapper;

    @Override
    public Map<String, Object> listPage(int pageNum, int pageSize, String provider) {
        LambdaQueryWrapper<LLMModel> wrapper = new LambdaQueryWrapper<>();
        if (provider != null && !provider.isEmpty()) {
            wrapper.eq(LLMModel::getProvider, provider);
        }
        wrapper.orderByDesc(LLMModel::getCreatedAt);

        Page<LLMModel> page = llmModelMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);

        Map<String, Object> result = new HashMap<>();
        result.put("total", page.getTotal());
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        result.put("list", page.getRecords().stream()
            .map(this::toModelMap)
            .collect(Collectors.toList()));
        return result;
    }

    @Override
    public Map<String, Object> getById(Long id) {
        LLMModel model = llmModelMapper.selectById(id);
        if (model == null) {
            throw new BusinessException(404, "模型不存在");
        }
        return toModelMap(model);
    }

    @Override
    public Map<String, Object> create(Map<String, Object> request) {
        LLMModel model = new LLMModel();
        model.setName((String) request.get("name"));
        model.setProvider((String) request.get("provider"));
        model.setModelName((String) request.get("modelName"));
        model.setApiKey(encryptApiKey((String) request.get("apiKey")));
        model.setApiEndpoint((String) request.get("apiEndpoint"));

        if (request.get("maxTokens") != null) {
            model.setMaxTokens(Integer.valueOf(request.get("maxTokens").toString()));
        } else {
            model.setMaxTokens(4096);
        }

        if (request.get("temperature") != null) {
            model.setTemperature(Double.valueOf(request.get("temperature").toString()));
        } else {
            model.setTemperature(0.7);
        }

        model.setStatus("active");
        model.setCreatedAt(LocalDateTime.now());
        model.setUpdatedAt(LocalDateTime.now());

        saveModel(model);
        return toModelMap(model);
    }

    @Override
    public Map<String, Object> update(Long id, Map<String, Object> request) {
        LLMModel model = llmModelMapper.selectById(id);
        if (model == null) {
            throw new BusinessException(404, "模型不存在");
        }

        if (request.get("name") != null) {
            model.setName((String) request.get("name"));
        }
        if (request.get("provider") != null) {
            model.setProvider((String) request.get("provider"));
        }
        if (request.get("modelName") != null) {
            model.setModelName((String) request.get("modelName"));
        }
        if (request.get("apiKey") != null) {
            model.setApiKey(encryptApiKey((String) request.get("apiKey")));
        }
        if (request.get("apiEndpoint") != null) {
            model.setApiEndpoint((String) request.get("apiEndpoint"));
        }
        if (request.get("maxTokens") != null) {
            model.setMaxTokens(Integer.valueOf(request.get("maxTokens").toString()));
        }
        if (request.get("temperature") != null) {
            model.setTemperature(Double.valueOf(request.get("temperature").toString()));
        }
        if (request.get("status") != null) {
            model.setStatus((String) request.get("status"));
        }

        model.setUpdatedAt(LocalDateTime.now());
        saveModel(model);
        return toModelMap(model);
    }

    @Override
    public void delete(Long id) {
        LLMModel model = llmModelMapper.selectById(id);
        if (model == null) {
            throw new BusinessException(404, "模型不存在");
        }
        llmModelMapper.deleteById(id);
    }

    @Override
    public Map<String, Object> getStats(Long id) {
        LLMModel model = llmModelMapper.selectById(id);
        if (model == null) {
            throw new BusinessException(404, "模型不存在");
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("modelId", id);
        stats.put("modelName", model.getName());
        stats.put("provider", model.getProvider());
        stats.put("totalCalls", 0L);
        stats.put("totalTokens", 0L);
        stats.put("avgLatency", 0.0);
        stats.put("successRate", 100.0);
        stats.put("lastCallTime", null);
        return stats;
    }

    private void saveModel(LLMModel model) {
        if (model.getId() == null) {
            llmModelMapper.insert(model);
        } else {
            llmModelMapper.updateById(model);
        }
    }

    private Map<String, Object> toModelMap(LLMModel model) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", model.getId());
        map.put("name", model.getName());
        map.put("provider", model.getProvider());
        map.put("modelName", model.getModelName());
        map.put("apiEndpoint", model.getApiEndpoint());
        map.put("maxTokens", model.getMaxTokens());
        map.put("temperature", model.getTemperature());
        map.put("status", model.getStatus());
        map.put("createdAt", model.getCreatedAt());
        map.put("updatedAt", model.getUpdatedAt());
        return map;
    }

    private String encryptApiKey(String apiKey) {
        if (apiKey == null || apiKey.isEmpty()) {
            return null;
        }
        return apiKey;
    }

    private String decryptApiKey(String encryptedKey) {
        if (encryptedKey == null || encryptedKey.isEmpty()) {
            return null;
        }
        return encryptedKey;
    }
}
