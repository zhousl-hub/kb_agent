package com.kba.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 模型路由实体
 *
 * @author kba
 */
@Data
@TableName("ai_model_route")
public class ModelRouter {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String name;

    private String modelAlias;

    private String targetModel;

    private Long providerId;

    private String providerName;

    private Integer priority;

    private String routeType;

    private String config;

    private String status;

    private Long tenantId;

    private Long createdBy;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
