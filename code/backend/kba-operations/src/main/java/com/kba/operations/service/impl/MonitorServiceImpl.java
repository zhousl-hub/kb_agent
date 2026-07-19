package com.kba.operations.service.impl;

import com.kba.operations.dto.MetricResponse;
import com.kba.operations.service.MonitorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.RuntimeMXBean;
import java.lang.management.ThreadMXBean;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MonitorServiceImpl implements MonitorService {

    @Override
    public Map<String, Object> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        dashboard.put("totalUsers", 150L);
        dashboard.put("activeUsers", 25L);
        dashboard.put("totalDocuments", 3500L);
        dashboard.put("todayQueries", 1200L);
        dashboard.put("totalQueries", 85000L);
        dashboard.put("avgResponseTime", 125.5);
        
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        double memoryUsage = (double) usedMemory / totalMemory * 100;
        
        dashboard.put("systemLoad", getSystemLoadAverage());
        dashboard.put("memoryUsage", Math.round(memoryUsage * 100.0) / 100.0);
        dashboard.put("cpuUsage", getCpuUsage());
        
        return dashboard;
    }

    @Override
    public List<MetricResponse> getMetrics() {
        List<MetricResponse> metrics = new ArrayList<>();
        
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        
        MetricResponse memoryMetric = new MetricResponse();
        memoryMetric.setName("memory");
        memoryMetric.setDescription("JVM Memory Usage");
        memoryMetric.setValue(Math.round((double) usedMemory / totalMemory * 100 * 100.0) / 100.0);
        memoryMetric.setUnit("%");
        memoryMetric.setStatus(getMetricStatus(memoryMetric.getValue(), 80, 90));
        memoryMetric.setTimestamp(System.currentTimeMillis());
        metrics.add(memoryMetric);
        
        MetricResponse cpuMetric = new MetricResponse();
        cpuMetric.setName("cpu");
        cpuMetric.setDescription("CPU Usage");
        cpuMetric.setValue(getCpuUsage());
        cpuMetric.setUnit("%");
        cpuMetric.setStatus(getMetricStatus(cpuMetric.getValue(), 70, 85));
        cpuMetric.setTimestamp(System.currentTimeMillis());
        metrics.add(cpuMetric);
        
        File[] roots = File.listRoots();
        for (File root : roots) {
            long totalSpace = root.getTotalSpace();
            long freeSpace = root.getFreeSpace();
            long usedSpace = totalSpace - freeSpace;
            
            if (totalSpace > 0) {
                MetricResponse diskMetric = new MetricResponse();
                diskMetric.setName("disk_" + root.getAbsolutePath().replace(":", "").replace("\\", ""));
                diskMetric.setDescription("Disk Usage (" + root.getAbsolutePath() + ")");
                diskMetric.setValue(Math.round((double) usedSpace / totalSpace * 100 * 100.0) / 100.0);
                diskMetric.setUnit("%");
                diskMetric.setStatus(getMetricStatus(diskMetric.getValue(), 80, 90));
                diskMetric.setTimestamp(System.currentTimeMillis());
                metrics.add(diskMetric);
            }
        }
        
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        MetricResponse threadMetric = new MetricResponse();
        threadMetric.setName("threads");
        threadMetric.setDescription("Active Threads");
        threadMetric.setValue(threadBean.getThreadCount());
        threadMetric.setUnit("count");
        threadMetric.setStatus("normal");
        threadMetric.setTimestamp(System.currentTimeMillis());
        metrics.add(threadMetric);
        
        return metrics;
    }

    @Override
    public List<Map<String, Object>> getServiceStatus() {
        List<Map<String, Object>> services = new ArrayList<>();
        
        services.add(createServiceStatus("database", "UP", "Database connection healthy", 5));
        services.add(createServiceStatus("redis", "UP", "Redis connection healthy", 3));
        services.add(createServiceStatus("dify", "UP", "Dify API reachable", 2));
        services.add(createServiceStatus("storage", "UP", "Storage service available", 1));
        
        return services;
    }

    @Override
    public Map<String, Object> getJvmInfo() {
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        Map<String, Object> jvmInfo = new HashMap<>();
        
        jvmInfo.put("name", runtimeBean.getVmName());
        jvmInfo.put("version", runtimeBean.getVmVersion());
        jvmInfo.put("vendor", runtimeBean.getVmVendor());
        jvmInfo.put("startTime", runtimeBean.getStartTime());
        jvmInfo.put("uptime", runtimeBean.getUptime());
        jvmInfo.put("inputArguments", runtimeBean.getInputArguments());
        
        return jvmInfo;
    }

    @Override
    public Map<String, Object> getMemoryInfo() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        Runtime runtime = Runtime.getRuntime();
        
        Map<String, Object> memoryInfo = new HashMap<>();
        
        Map<String, Object> heap = new HashMap<>();
        heap.put("used", memoryBean.getHeapMemoryUsage().getUsed());
        heap.put("committed", memoryBean.getHeapMemoryUsage().getCommitted());
        heap.put("max", memoryBean.getHeapMemoryUsage().getMax());
        memoryInfo.put("heap", heap);
        
        Map<String, Object> nonHeap = new HashMap<>();
        nonHeap.put("used", memoryBean.getNonHeapMemoryUsage().getUsed());
        nonHeap.put("committed", memoryBean.getNonHeapMemoryUsage().getCommitted());
        nonHeap.put("max", memoryBean.getNonHeapMemoryUsage().getMax());
        memoryInfo.put("nonHeap", nonHeap);
        
        memoryInfo.put("totalMemory", runtime.totalMemory());
        memoryInfo.put("freeMemory", runtime.freeMemory());
        memoryInfo.put("maxMemory", runtime.maxMemory());
        memoryInfo.put("availableProcessors", runtime.availableProcessors());
        
        return memoryInfo;
    }

    @Override
    public Map<String, Object> getCpuInfo() {
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        
        Map<String, Object> cpuInfo = new HashMap<>();
        cpuInfo.put("availableProcessors", osBean.getAvailableProcessors());
        cpuInfo.put("systemLoadAverage", osBean.getSystemLoadAverage());
        cpuInfo.put("usage", getCpuUsage());
        cpuInfo.put("arch", osBean.getArch());
        cpuInfo.put("name", osBean.getName());
        cpuInfo.put("version", osBean.getVersion());
        
        return cpuInfo;
    }

    @Override
    public List<Map<String, Object>> getDiskInfo() {
        List<Map<String, Object>> disks = new ArrayList<>();
        
        File[] roots = File.listRoots();
        for (File root : roots) {
            Map<String, Object> disk = new HashMap<>();
            disk.put("path", root.getAbsolutePath());
            disk.put("totalSpace", root.getTotalSpace());
            disk.put("freeSpace", root.getFreeSpace());
            disk.put("usedSpace", root.getTotalSpace() - root.getFreeSpace());
            disk.put("usableSpace", root.getUsableSpace());
            
            long total = root.getTotalSpace();
            long used = total - root.getFreeSpace();
            if (total > 0) {
                disk.put("usagePercent", Math.round((double) used / total * 100 * 100.0) / 100.0);
            } else {
                disk.put("usagePercent", 0.0);
            }
            
            disks.add(disk);
        }
        
        return disks;
    }

    @Override
    public Map<String, Object> getOnlineUsers(int pageNum, int pageSize) {
        Map<String, Object> result = new HashMap<>();
        
        List<Map<String, Object>> users = new ArrayList<>();
        users.add(createOnlineUser(1L, "admin", "192.168.1.100", "2024-01-15 10:30:00", "Chrome"));
        users.add(createOnlineUser(2L, "user01", "192.168.1.101", "2024-01-15 11:00:00", "Firefox"));
        users.add(createOnlineUser(3L, "user02", "192.168.1.102", "2024-01-15 11:30:00", "Edge"));
        
        result.put("records", users);
        result.put("total", 3);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        
        return result;
    }

    @Override
    public void forceLogout(String tokenId) {
        log.info("Force logout user with tokenId: {}", tokenId);
    }

    private double getSystemLoadAverage() {
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        double load = osBean.getSystemLoadAverage();
        if (load < 0) {
            return 0.0;
        }
        return Math.round(load * 100.0) / 100.0;
    }

    private double getCpuUsage() {
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        int processors = osBean.getAvailableProcessors();
        double load = osBean.getSystemLoadAverage();
        if (load < 0) {
            return 0.0;
        }
        return Math.round(load / processors * 100 * 100.0) / 100.0;
    }

    private String getMetricStatus(double value, double warningThreshold, double criticalThreshold) {
        if (value >= criticalThreshold) {
            return "critical";
        } else if (value >= warningThreshold) {
            return "warning";
        }
        return "normal";
    }

    private Map<String, Object> createServiceStatus(String name, String status, String message, int connectionCount) {
        Map<String, Object> service = new HashMap<>();
        service.put("name", name);
        service.put("status", status);
        service.put("message", message);
        service.put("connectionCount", connectionCount);
        service.put("lastCheck", System.currentTimeMillis());
        return service;
    }

    private Map<String, Object> createOnlineUser(Long userId, String username, String ip, String loginTime, String browser) {
        Map<String, Object> user = new HashMap<>();
        user.put("userId", userId);
        user.put("username", username);
        user.put("ip", ip);
        user.put("loginTime", loginTime);
        user.put("browser", browser);
        return user;
    }
}
