package com.kba.operations.entity;

import lombok.Data;

/**
 * 系统指标实体
 *
 * @author kba
 */
@Data
public class Metric {

    private String name;

    private String description;

    private double value;

    private String unit;

    private String status;

    private long timestamp;
}
