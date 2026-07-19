package com.kba.ai.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 助手会话响应
 *
 * @author kba
 */
@Data
public class AssistantSessionResponse {

    private Long id;

    private Long assistantId;

    private String title;

    private Integer messageCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
