package com.kba.ai.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 模型响应
 *
 * @author kba
 */
@Data
public class ModelResponse {

    private Long id;

    private String name;

    private String provider;

    private String modelName;

    private Integer maxTokens;

    private Double temperature;

    private String status;

    private LocalDateTime createdAt;
}
