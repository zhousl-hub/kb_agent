package com.kba.operations.service;

import com.kba.operations.dto.AuditLogCreateRequest;
import com.kba.operations.dto.AuditLogResponse;

import java.util.List;
import java.util.Map;

/**
 * 审计服务接口
 *
 * @author kba
 */
public interface AuditService {

    Map<String, Object> listLogs(int pageNum, int pageSize, String module, String action, Long userId, String startTime, String endTime);

    AuditLogResponse getLogById(Long id);

    void createLog(AuditLogCreateRequest request);

    List<String> listModules();

    List<String> listActions();

    String exportLogs(String module, String action, Long userId, String startTime, String endTime);
}
