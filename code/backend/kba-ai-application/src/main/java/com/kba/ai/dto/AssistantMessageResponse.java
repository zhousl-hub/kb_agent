package com.kba.ai.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 助手消息响应
 *
 * @author kba
 */
@Data
public class AssistantMessageResponse {

    private Long id;

    private Long sessionId;

    private String role;

    private String content;

    private Integer tokenCount;

    private LocalDateTime createdAt;
}
