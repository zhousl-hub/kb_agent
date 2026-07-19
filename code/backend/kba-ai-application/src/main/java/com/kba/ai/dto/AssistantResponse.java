package com.kba.ai.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 助手响应
 *
 * @author kba
 */
@Data
public class AssistantResponse {

    private Long id;

    private String name;

    private String description;

    private String icon;

    private String promptTemplate;

    private Long modelId;

    private Long knowledgeId;

    private String difyAppId;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
