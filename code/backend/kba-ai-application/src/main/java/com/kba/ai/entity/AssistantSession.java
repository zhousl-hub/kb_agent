package com.kba.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 助手会话实体
 */
@Data
@TableName("ai_assistant_session")
public class AssistantSession {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long tenantId;

    @TableField("assistant_id")
    private Long assistantId;

    @TableField("user_id")
    private Long userId;

    private String title;

    private Integer status;

    @TableField(exist = false)
    private String difyConversationId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
