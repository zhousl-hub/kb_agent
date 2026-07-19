package com.kba.operations.dto;

import lombok.Data;

/**
 * 仪表盘统计响应
 *
 * @author kba
 */
@Data
public class DashboardStatsResponse {

    private long totalUsers;

    private long activeUsers;

    private long totalDocuments;

    private long todayQueries;

    private long totalQueries;

    private double avgResponseTime;

    private double systemLoad;

    private double memoryUsage;

    private double cpuUsage;
}
