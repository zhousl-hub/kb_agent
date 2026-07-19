package com.kba.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 助手实体
 */
@Data
@TableName("ai_assistant")
public class Assistant {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String description;

    private String avatar;

    private String category;

    private String capabilities;

    @TableField("system_prompt")
    private String systemPrompt;

    @TableField("knowledge_space_ids")
    private String knowledgeSpaceIds;

    @TableField("model_id")
    private Long modelId;

    @TableField("is_popular")
    private Integer isPopular;

    private Integer status;

    @TableField("created_by")
    private Long createdBy;

    private Long tenantId;

    @TableField("deleted_at")
    private LocalDateTime deletedAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
