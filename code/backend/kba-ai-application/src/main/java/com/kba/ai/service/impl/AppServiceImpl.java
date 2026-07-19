package com.kba.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.ai.entity.AIApp;
import com.kba.ai.mapper.AIAppMapper;
import com.kba.ai.service.AppService;
import com.kba.common.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 应用服务实现
 *
 * @author kba
 */
@Service
@RequiredArgsConstructor
public class AppServiceImpl implements AppService {

    private final AIAppMapper aiAppMapper;

    @Override
    public Map<String, Object> listPage(int pageNum, int pageSize, String type, String status) {
        LambdaQueryWrapper<AIApp> wrapper = new LambdaQueryWrapper<>();
        if (type != null && !type.isEmpty()) {
            wrapper.eq(AIApp::getType, type);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(AIApp::getStatus, status);
        }
        wrapper.orderByDesc(AIApp::getCreatedAt);

        Page<AIApp> page = aiAppMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);

        Map<String, Object> result = new HashMap<>();
        result.put("total", page.getTotal());
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        result.put("list", page.getRecords().stream()
            .map(this::toAppMap)
            .collect(Collectors.toList()));
        return result;
    }

    @Override
    public Map<String, Object> getById(Long id) {
        AIApp app = aiAppMapper.selectById(id);
        if (app == null) {
            throw new BusinessException(404, "应用不存在");
        }
        return toAppMap(app);
    }

    @Override
    public Map<String, Object> create(Map<String, Object> request) {
        AIApp app = new AIApp();
        app.setName((String) request.get("name"));
        app.setDescription((String) request.get("description"));
        app.setType((String) request.get("type"));
        app.setStatus("draft");
        if (request.get("modelId") != null) {
            app.setModelId(Long.valueOf(request.get("modelId").toString()));
        }
        if (request.get("knowledgeId") != null) {
            app.setKnowledgeId(Long.valueOf(request.get("knowledgeId").toString()));
        }
        app.setPromptTemplate((String) request.get("promptTemplate"));
        app.setCreatedAt(LocalDateTime.now());
        app.setUpdatedAt(LocalDateTime.now());
        aiAppMapper.insert(app);
        return toAppMap(app);
    }

    @Override
    public Map<String, Object> update(Long id, Map<String, Object> request) {
        AIApp app = aiAppMapper.selectById(id);
        if (app == null) {
            throw new BusinessException(404, "应用不存在");
        }

        if (request.get("name") != null) {
            app.setName((String) request.get("name"));
        }
        if (request.get("description") != null) {
            app.setDescription((String) request.get("description"));
        }
        if (request.get("type") != null) {
            app.setType((String) request.get("type"));
        }
        if (request.get("modelId") != null) {
            app.setModelId(Long.valueOf(request.get("modelId").toString()));
        }
        if (request.get("knowledgeId") != null) {
            app.setKnowledgeId(Long.valueOf(request.get("knowledgeId").toString()));
        }
        if (request.get("promptTemplate") != null) {
            app.setPromptTemplate((String) request.get("promptTemplate"));
        }
        app.setUpdatedAt(LocalDateTime.now());

        aiAppMapper.updateById(app);
        return toAppMap(app);
    }

    @Override
    public void delete(Long id) {
        AIApp app = aiAppMapper.selectById(id);
        if (app == null) {
            throw new BusinessException(404, "应用不存在");
        }
        aiAppMapper.deleteById(id);
    }

    @Override
    public void publish(Long id) {
        AIApp app = aiAppMapper.selectById(id);
        if (app == null) {
            throw new BusinessException(404, "应用不存在");
        }
        aiAppMapper.update(null,
            new LambdaUpdateWrapper<AIApp>()
                .eq(AIApp::getId, id)
                .set(AIApp::getStatus, "published"));
    }

    private Map<String, Object> toAppMap(AIApp app) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", app.getId());
        map.put("name", app.getName());
        map.put("description", app.getDescription());
        map.put("type", app.getType());
        map.put("status", app.getStatus());
        map.put("modelId", app.getModelId());
        map.put("knowledgeId", app.getKnowledgeId());
        map.put("promptTemplate", app.getPromptTemplate());
        map.put("difyAppId", app.getDifyAppId());
        map.put("createdAt", app.getCreatedAt());
        map.put("updatedAt", app.getUpdatedAt());
        return map;
    }
}
