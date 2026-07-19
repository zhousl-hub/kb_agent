package com.kba.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.ai.entity.Assistant;
import com.kba.ai.mapper.AssistantMapper;
import com.kba.ai.service.AssistantService;
import com.kba.common.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 助手服务实现
 *
 * @author kba
 */
@Service
@RequiredArgsConstructor
public class AssistantServiceImpl implements AssistantService {

    private final AssistantMapper assistantMapper;
    private final ObjectMapper objectMapper;

    @Override
    public Map<String, Object> listPage(int pageNum, int pageSize, String status) {
        LambdaQueryWrapper<Assistant> wrapper = new LambdaQueryWrapper<>();
        wrapper.isNull(Assistant::getDeletedAt);
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Assistant::getStatus, Integer.valueOf(status));
        }
        wrapper.orderByDesc(Assistant::getCreatedAt);

        Page<Assistant> page = assistantMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);

        Map<String, Object> result = new HashMap<>();
        result.put("total", page.getTotal());
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        List<Map<String, Object>> items = page.getRecords().stream()
            .map(this::toAssistantMap)
            .collect(Collectors.toList());
        result.put("list", items);
        result.put("items", items);
        return result;
    }

    @Override
    public Map<String, Object> getById(Long id) {
        Assistant assistant = assistantMapper.selectById(id);
        if (assistant == null) {
            throw new BusinessException(404, "助手不存在");
        }
        return toAssistantMap(assistant);
    }

    @Override
    public Map<String, Object> create(Map<String, Object> request) {
        Assistant assistant = new Assistant();
        assistant.setName((String) request.get("name"));
        assistant.setDescription((String) request.get("description"));
        assistant.setAvatar((String) request.get("avatar"));
        assistant.setSystemPrompt((String) request.get("systemPrompt"));
        assistant.setStatus(1);
        if (request.get("modelId") != null) {
            assistant.setModelId(Long.valueOf(request.get("modelId").toString()));
        }
        assistant.setCreatedAt(LocalDateTime.now());
        assistant.setUpdatedAt(LocalDateTime.now());
        assistantMapper.insert(assistant);
        return toAssistantMap(assistant);
    }

    @Override
    public Map<String, Object> update(Long id, Map<String, Object> request) {
        Assistant assistant = assistantMapper.selectById(id);
        if (assistant == null) {
            throw new BusinessException(404, "助手不存在");
        }

        if (request.get("name") != null) {
            assistant.setName((String) request.get("name"));
        }
        if (request.get("description") != null) {
            assistant.setDescription((String) request.get("description"));
        }
        if (request.get("avatar") != null) {
            assistant.setAvatar((String) request.get("avatar"));
        }
        if (request.get("systemPrompt") != null) {
            assistant.setSystemPrompt((String) request.get("systemPrompt"));
        }
        if (request.get("modelId") != null) {
            assistant.setModelId(Long.valueOf(request.get("modelId").toString()));
        }
        assistant.setUpdatedAt(LocalDateTime.now());

        assistantMapper.updateById(assistant);
        return toAssistantMap(assistant);
    }

    @Override
    public void delete(Long id) {
        Assistant assistant = assistantMapper.selectById(id);
        if (assistant == null) {
            throw new BusinessException(404, "助手不存在");
        }
        assistantMapper.deleteById(id);
    }

    private Map<String, Object> toAssistantMap(Assistant assistant) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", String.valueOf(assistant.getId()));
        map.put("name", assistant.getName());
        map.put("description", assistant.getDescription());
        map.put("avatar", assistant.getAvatar());
        map.put("category", assistant.getCategory());
        map.put("capabilities", parseCapabilities(assistant.getCapabilities()));
        map.put("systemPrompt", assistant.getSystemPrompt());
        map.put("modelId", assistant.getModelId());
        map.put("isPopular", assistant.getIsPopular() != null && assistant.getIsPopular() == 1);
        map.put("status", assistant.getStatus());
        map.put("createdAt", assistant.getCreatedAt());
        map.put("updatedAt", assistant.getUpdatedAt());
        return map;
    }

    private List<String> parseCapabilities(String capabilities) {
        if (capabilities == null || capabilities.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(capabilities, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
