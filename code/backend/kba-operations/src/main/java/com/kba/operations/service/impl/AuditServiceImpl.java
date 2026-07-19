package com.kba.operations.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.operations.dto.AuditLogCreateRequest;
import com.kba.operations.dto.AuditLogResponse;
import com.kba.operations.service.AuditService;
import com.kba.operations.entity.AuditLog;
import com.kba.operations.mapper.AuditLogMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogMapper auditLogMapper;

    @Override
    public Map<String, Object> listLogs(int pageNum, int pageSize, String module, String action, Long userId, String startTime, String endTime) {
        LambdaQueryWrapper<AuditLog> wrapper = new LambdaQueryWrapper<>();
        
        if (module != null && !module.isEmpty()) {
            wrapper.eq(AuditLog::getModule, module);
        }
        if (action != null && !action.isEmpty()) {
            wrapper.eq(AuditLog::getAction, action);
        }
        if (userId != null) {
            wrapper.eq(AuditLog::getUserId, userId);
        }
        if (startTime != null && !startTime.isEmpty()) {
            wrapper.ge(AuditLog::getCreatedAt, LocalDateTime.parse(startTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        if (endTime != null && !endTime.isEmpty()) {
            wrapper.le(AuditLog::getCreatedAt, LocalDateTime.parse(endTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        
        wrapper.orderByDesc(AuditLog::getCreatedAt);
        
        Page<AuditLog> page = auditLogMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        
        List<AuditLogResponse> records = page.getRecords().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("records", records);
        result.put("total", page.getTotal());
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        return result;
    }

    @Override
    public AuditLogResponse getLogById(Long id) {
        AuditLog auditLog = auditLogMapper.selectById(id);
        if (auditLog == null) {
            throw new RuntimeException("Audit log not found: " + id);
        }
        return toResponse(auditLog);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createLog(AuditLogCreateRequest request) {
        AuditLog auditLog = new AuditLog();
        BeanUtils.copyProperties(request, auditLog);
        if (auditLog.getCreatedAt() == null) {
            auditLog.setCreatedAt(LocalDateTime.now());
        }
        // 原仓储 save 逻辑：无主键则插入，否则更新
        if (auditLog.getId() == null) {
            auditLogMapper.insert(auditLog);
        } else {
            auditLogMapper.updateById(auditLog);
        }
        log.info("Created audit log: module={}, action={}", request.getModule(), request.getAction());
    }

    @Override
    public List<String> listModules() {
        // 原仓储 findAllModules 逻辑：按 module 分组查询后去重
        List<AuditLog> logs = auditLogMapper.selectList(
            new LambdaQueryWrapper<AuditLog>()
                .select(AuditLog::getModule)
                .groupBy(AuditLog::getModule)
        );
        return logs.stream()
            .map(AuditLog::getModule)
            .filter(m -> m != null && !m.isEmpty())
            .distinct()
            .collect(Collectors.toList());
    }

    @Override
    public List<String> listActions() {
        // 原仓储 findAllActions 逻辑：按 action 分组查询后去重
        List<AuditLog> logs = auditLogMapper.selectList(
            new LambdaQueryWrapper<AuditLog>()
                .select(AuditLog::getAction)
                .groupBy(AuditLog::getAction)
        );
        return logs.stream()
            .map(AuditLog::getAction)
            .filter(a -> a != null && !a.isEmpty())
            .distinct()
            .collect(Collectors.toList());
    }

    @Override
    public String exportLogs(String module, String action, Long userId, String startTime, String endTime) {
        LambdaQueryWrapper<AuditLog> wrapper = new LambdaQueryWrapper<>();
        
        if (module != null && !module.isEmpty()) {
            wrapper.eq(AuditLog::getModule, module);
        }
        if (action != null && !action.isEmpty()) {
            wrapper.eq(AuditLog::getAction, action);
        }
        if (userId != null) {
            wrapper.eq(AuditLog::getUserId, userId);
        }
        if (startTime != null && !startTime.isEmpty()) {
            wrapper.ge(AuditLog::getCreatedAt, LocalDateTime.parse(startTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        if (endTime != null && !endTime.isEmpty()) {
            wrapper.le(AuditLog::getCreatedAt, LocalDateTime.parse(endTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        
        wrapper.orderByDesc(AuditLog::getCreatedAt);
        
        List<AuditLog> logs = auditLogMapper.selectList(wrapper);
        
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Module,Action,ResourceType,ResourceId,ResourceName,UserId,Username,IP,RequestMethod,RequestUrl,ResponseStatus,Duration,CreatedAt\n");
        
        for (AuditLog log : logs) {
            csv.append(String.format("%d,%s,%s,%s,%s,%s,%d,%s,%s,%s,%s,%d,%d,%s\n",
                log.getId(),
                escapeCsv(log.getModule()),
                escapeCsv(log.getAction()),
                escapeCsv(log.getResourceType()),
                log.getResourceId(),
                escapeCsv(log.getResourceName()),
                log.getUserId(),
                escapeCsv(log.getUsername()),
                escapeCsv(log.getIp()),
                escapeCsv(log.getRequestMethod()),
                escapeCsv(log.getRequestUrl()),
                log.getResponseStatus(),
                log.getDuration(),
                log.getCreatedAt()
            ));
        }
        
        log.info("Exported {} audit logs", logs.size());
        return csv.toString();
    }

    private AuditLogResponse toResponse(AuditLog auditLog) {
        AuditLogResponse response = new AuditLogResponse();
        BeanUtils.copyProperties(auditLog, response);
        return response;
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
