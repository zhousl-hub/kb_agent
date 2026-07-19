package com.kba.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI应用实体
 *
 * @author kba
 */
@Data
@TableName("ai_app")
public class AIApp {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String name;

    private String description;

    private String type;

    private String status;

    private Long modelId;

    private Long knowledgeId;

    private String promptTemplate;

    private String difyAppId;

    private Long tenantId;

    private Long createdBy;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
