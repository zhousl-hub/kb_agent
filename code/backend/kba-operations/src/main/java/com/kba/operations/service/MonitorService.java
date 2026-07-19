package com.kba.operations.service;

import com.kba.operations.dto.MetricResponse;

import java.util.List;
import java.util.Map;

/**
 * 监控服务接口
 *
 * @author kba
 */
public interface MonitorService {

    Map<String, Object> getDashboard();

    List<MetricResponse> getMetrics();

    List<Map<String, Object>> getServiceStatus();

    Map<String, Object> getJvmInfo();

    Map<String, Object> getMemoryInfo();

    Map<String, Object> getCpuInfo();

    List<Map<String, Object>> getDiskInfo();

    Map<String, Object> getOnlineUsers(int pageNum, int pageSize);

    void forceLogout(String tokenId);
}
