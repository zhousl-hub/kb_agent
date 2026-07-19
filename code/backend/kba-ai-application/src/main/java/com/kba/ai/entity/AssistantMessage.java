package com.kba.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 助手消息实体
 */
@Data
@TableName("ai_assistant_message")
public class AssistantMessage {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("session_id")
    private Long sessionId;

    private Long tenantId;

    private String role;

    private String content;

    @TableField(exist = false)
    private Integer tokenCount;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
