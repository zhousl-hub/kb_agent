package com.kba.knowledge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.common.core.exception.BusinessException;
import com.kba.knowledge.service.DataSourceService;
import com.kba.knowledge.entity.DataSource;
import com.kba.knowledge.entity.SyncTask;
import com.kba.knowledge.enums.SyncStatus;
import com.kba.knowledge.mapper.DataSourceMapper;
import com.kba.knowledge.mapper.SyncTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DataSourceServiceImpl implements DataSourceService {

    private final DataSourceMapper dataSourceMapper;
    private final SyncTaskMapper syncTaskMapper;

    @Override
    public Map<String, Object> listPage(int pageNum, int pageSize, Long knowledgeId) {
        Page<DataSource> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<DataSource> wrapper = new LambdaQueryWrapper<>();
        
        if (knowledgeId != null) {
            wrapper.eq(DataSource::getKnowledgeId, knowledgeId);
        }
        wrapper.orderByDesc(DataSource::getCreatedAt);
        
        Page<DataSource> result = dataSourceMapper.selectPage(page, wrapper);
        
        List<Map<String, Object>> list = result.getRecords().stream()
            .map(this::toMap)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("list", list);
        response.put("total", result.getTotal());
        response.put("pageNum", pageNum);
        response.put("pageSize", pageSize);
        return response;
    }

    @Override
    public Map<String, Object> getById(Long id) {
        DataSource dataSource = dataSourceMapper.selectById(id);
        if (dataSource == null) {
            throw new BusinessException(404, "数据源不存在");
        }
        return toMap(dataSource);
    }

    @Override
    @Transactional
    public Map<String, Object> create(Map<String, Object> request) {
        DataSource dataSource = new DataSource();
        dataSource.setName((String) request.get("name"));
        dataSource.setType((String) request.get("type"));
        dataSource.setConfig((String) request.get("config"));
        dataSource.setKnowledgeId(request.get("knowledgeId") != null ? Long.valueOf(request.get("knowledgeId").toString()) : null);
        dataSource.setStatus("active");
        dataSource.setTenantId(request.get("tenantId") != null ? Long.valueOf(request.get("tenantId").toString()) : null);
        dataSource.setCreatedBy(request.get("createdBy") != null ? Long.valueOf(request.get("createdBy").toString()) : null);
        dataSource.setCreatedAt(LocalDateTime.now());
        dataSource.setUpdatedAt(LocalDateTime.now());
        
        dataSourceMapper.insert(dataSource);
        
        return toMap(dataSource);
    }

    @Override
    public Map<String, Object> update(Long id, Map<String, Object> request) {
        DataSource dataSource = dataSourceMapper.selectById(id);
        if (dataSource == null) {
            throw new BusinessException(404, "数据源不存在");
        }
        
        if (request.get("name") != null) {
            dataSource.setName((String) request.get("name"));
        }
        if (request.get("config") != null) {
            dataSource.setConfig((String) request.get("config"));
        }
        dataSource.setUpdatedAt(LocalDateTime.now());
        
        dataSourceMapper.updateById(dataSource);
        return toMap(dataSource);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        DataSource dataSource = dataSourceMapper.selectById(id);
        if (dataSource == null) {
            throw new BusinessException(404, "数据源不存在");
        }
        dataSourceMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void sync(Long id) {
        DataSource dataSource = dataSourceMapper.selectById(id);
        if (dataSource == null) {
            throw new BusinessException(404, "数据源不存在");
        }
        
        SyncTask syncTask = new SyncTask();
        syncTask.setDataSourceId(id);
        syncTask.setStatus(SyncStatus.PENDING.getCode());
        syncTask.setTotalDocs(0);
        syncTask.setProcessedDocs(0);
        syncTask.setFailedDocs(0);
        syncTask.setStartedAt(LocalDateTime.now());
        syncTask.setCreatedAt(LocalDateTime.now());
        syncTask.setUpdatedAt(LocalDateTime.now());
        
        syncTaskMapper.insert(syncTask);
        
        dataSource.setStatus("syncing");
        dataSource.setUpdatedAt(LocalDateTime.now());
        dataSourceMapper.updateById(dataSource);
    }

    private Map<String, Object> toMap(DataSource ds) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", ds.getId());
        map.put("name", ds.getName());
        map.put("type", ds.getType());
        map.put("config", ds.getConfig());
        map.put("knowledgeId", ds.getKnowledgeId());
        map.put("status", ds.getStatus());
        map.put("createdAt", ds.getCreatedAt());
        map.put("updatedAt", ds.getUpdatedAt());
        return map;
    }
}
