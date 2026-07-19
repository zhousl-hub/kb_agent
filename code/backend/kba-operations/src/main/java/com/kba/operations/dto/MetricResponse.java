package com.kba.operations.dto;

import lombok.Data;

/**
 * 系统指标响应
 *
 * @author kba
 */
@Data
public class MetricResponse {

    private String name;

    private String description;

    private double value;

    private String unit;

    private String status;

    private long timestamp;
}
