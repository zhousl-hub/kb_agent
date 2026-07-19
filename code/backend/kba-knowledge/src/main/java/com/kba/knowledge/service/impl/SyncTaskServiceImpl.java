package com.kba.knowledge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.common.core.exception.BusinessException;
import com.kba.knowledge.service.SyncTaskService;
import com.kba.knowledge.entity.SyncTask;
import com.kba.knowledge.enums.SyncStatus;
import com.kba.knowledge.mapper.SyncTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SyncTaskServiceImpl implements SyncTaskService {

    private final SyncTaskMapper syncTaskMapper;

    @Override
    public Map<String, Object> listPage(int pageNum, int pageSize, Long dataSourceId) {
        Page<SyncTask> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SyncTask> wrapper = new LambdaQueryWrapper<>();
        
        if (dataSourceId != null) {
            wrapper.eq(SyncTask::getDataSourceId, dataSourceId);
        }
        wrapper.orderByDesc(SyncTask::getCreatedAt);
        
        Page<SyncTask> result = syncTaskMapper.selectPage(page, wrapper);
        
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
        SyncTask syncTask = syncTaskMapper.selectById(id);
        if (syncTask == null) {
            throw new BusinessException(404, "同步任务不存在");
        }
        return toMap(syncTask);
    }

    @Override
    public void cancel(Long id) {
        SyncTask syncTask = syncTaskMapper.selectById(id);
        if (syncTask == null) {
            throw new BusinessException(404, "同步任务不存在");
        }
        
        if (!SyncStatus.PENDING.getCode().equals(syncTask.getStatus()) 
            && !SyncStatus.RUNNING.getCode().equals(syncTask.getStatus())) {
            throw new BusinessException(400, "该任务无法取消");
        }
        
        syncTask.setStatus(SyncStatus.CANCELLED.getCode());
        syncTask.setCompletedAt(LocalDateTime.now());
        syncTask.setUpdatedAt(LocalDateTime.now());
        syncTaskMapper.updateById(syncTask);
    }

    private Map<String, Object> toMap(SyncTask task) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", task.getId());
        map.put("dataSourceId", task.getDataSourceId());
        map.put("status", task.getStatus());
        map.put("totalDocs", task.getTotalDocs());
        map.put("processedDocs", task.getProcessedDocs());
        map.put("failedDocs", task.getFailedDocs());
        map.put("errorMessage", task.getErrorMessage());
        map.put("startedAt", task.getStartedAt());
        map.put("completedAt", task.getCompletedAt());
        map.put("createdAt", task.getCreatedAt());
        return map;
    }
}
