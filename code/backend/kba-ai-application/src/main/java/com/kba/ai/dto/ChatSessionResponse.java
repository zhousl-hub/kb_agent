package com.kba.ai.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 对话会话响应
 *
 * @author kba
 */
@Data
public class ChatSessionResponse {

    private Long id;

    private Long appId;

    private String title;

    private Integer messageCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
