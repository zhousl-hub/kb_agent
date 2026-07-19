package com.kba.knowledge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.common.core.exception.BusinessException;
import com.kba.knowledge.service.KnowledgeService;
import com.kba.knowledge.entity.DataSource;
import com.kba.knowledge.entity.Document;
import com.kba.knowledge.entity.Knowledge;
import com.kba.knowledge.mapper.DataSourceMapper;
import com.kba.knowledge.mapper.DocumentMapper;
import com.kba.knowledge.mapper.KnowledgeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KnowledgeServiceImpl implements KnowledgeService {

    private final KnowledgeMapper knowledgeMapper;
    private final DataSourceMapper dataSourceMapper;
    private final DocumentMapper documentMapper;

    @Override
    public Map<String, Object> listPage(int pageNum, int pageSize, Long spaceId) {
        Page<Knowledge> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Knowledge> wrapper = new LambdaQueryWrapper<>();
        
        if (spaceId != null) {
            wrapper.eq(Knowledge::getSpaceId, spaceId);
        }
        wrapper.orderByDesc(Knowledge::getCreatedAt);
        
        Page<Knowledge> result = knowledgeMapper.selectPage(page, wrapper);
        
        List<Map<String, Object>> list = result.getRecords().stream()
            .map(this::toMap)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("list", list);
        response.put("items", list);
        response.put("total", result.getTotal());
        response.put("pageNum", pageNum);
        response.put("page", pageNum);
        response.put("pageSize", pageSize);
        return response;
    }

    @Override
    public Map<String, Object> getById(Long id) {
        Knowledge knowledge = knowledgeMapper.selectById(id);
        if (knowledge == null) {
            throw new BusinessException(404, "知识库不存在");
        }
        
        Map<String, Object> result = toMap(knowledge);
        
        LambdaQueryWrapper<DataSource> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DataSource::getKnowledgeId, id);
        Long dataSourceCount = dataSourceMapper.selectCount(wrapper);
        result.put("dataSourceCount", dataSourceCount);
        
        return result;
    }

    @Override
    public Map<String, Object> create(Map<String, Object> request) {
        Knowledge knowledge = new Knowledge();
        knowledge.setName((String) request.get("name"));
        knowledge.setDescription((String) request.get("description"));
        knowledge.setSpaceId(request.get("spaceId") != null ? Long.valueOf(request.get("spaceId").toString()) : null);
        knowledge.setTenantId(request.get("tenantId") != null ? Long.valueOf(request.get("tenantId").toString()) : null);
        knowledge.setCreatedBy(request.get("createdBy") != null ? Long.valueOf(request.get("createdBy").toString()) : null);
        knowledge.setCreatedAt(LocalDateTime.now());
        knowledge.setUpdatedAt(LocalDateTime.now());
        
        knowledgeMapper.insert(knowledge);
        return toMap(knowledge);
    }

    @Override
    public Map<String, Object> update(Long id, Map<String, Object> request) {
        Knowledge knowledge = knowledgeMapper.selectById(id);
        if (knowledge == null) {
            throw new BusinessException(404, "知识库不存在");
        }
        
        if (request.get("name") != null) {
            knowledge.setName((String) request.get("name"));
        }
        if (request.get("description") != null) {
            knowledge.setDescription((String) request.get("description"));
        }
        knowledge.setUpdatedAt(LocalDateTime.now());
        
        knowledgeMapper.updateById(knowledge);
        return toMap(knowledge);
    }

    @Override
    public void delete(Long id) {
        Knowledge knowledge = knowledgeMapper.selectById(id);
        if (knowledge == null) {
            throw new BusinessException(404, "知识库不存在");
        }
        knowledgeMapper.deleteById(id);
    }

    @Override
    public Map<String, Object> getStats() {
        LambdaQueryWrapper<Knowledge> spaceWrapper = new LambdaQueryWrapper<>();
        spaceWrapper.isNull(Knowledge::getDeletedAt);
        List<Knowledge> spaces = knowledgeMapper.selectList(spaceWrapper);

        List<Map<String, Object>> categoryData = spaces.stream()
                .map(space -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", space.getName());
                    item.put("value", space.getDocumentCount() != null ? space.getDocumentCount() : 0);
                    return item;
                })
                .collect(Collectors.toList());

        int[] trendData = new int[7];
        LocalDateTime weekStart = LocalDateTime.now().minusDays(6).withHour(0).withMinute(0).withSecond(0);
        LambdaQueryWrapper<Document> docWrapper = new LambdaQueryWrapper<>();
        docWrapper.isNull(Document::getDeletedAt)
                .ge(Document::getUpdatedAt, weekStart);
        List<Document> documents = documentMapper.selectList(docWrapper);
        for (Document document : documents) {
            if (document.getUpdatedAt() == null) {
                continue;
            }
            long dayIndex = ChronoUnit.DAYS.between(weekStart.toLocalDate(), document.getUpdatedAt().toLocalDate());
            if (dayIndex >= 0 && dayIndex < 7) {
                trendData[(int) dayIndex]++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("categoryData", categoryData);
        result.put("trendData", Arrays.stream(trendData).boxed().collect(Collectors.toList()));
        return result;
    }

    private Map<String, Object> toMap(Knowledge k) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", String.valueOf(k.getId()));
        map.put("name", k.getName());
        map.put("description", k.getDescription());
        map.put("icon", k.getIcon());
        map.put("documentCount", k.getDocumentCount());
        map.put("spaceId", k.getId());
        map.put("createdAt", k.getCreatedAt());
        map.put("updatedAt", k.getUpdatedAt());
        return map;
    }
}
