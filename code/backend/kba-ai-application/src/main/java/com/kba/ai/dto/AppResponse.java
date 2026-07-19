package com.kba.ai.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 应用响应
 *
 * @author kba
 */
@Data
public class AppResponse {

    private Long id;

    private String name;

    private String description;

    private String type;

    private String status;

    private Long modelId;

    private Long knowledgeId;

    private String difyAppId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
