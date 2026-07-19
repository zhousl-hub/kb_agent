package com.kba.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 模型供应商实体
 *
 * @author kba
 */
@Data
@TableName("ai_model_provider")
public class ModelProvider {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String name;

    private String code;

    private String type;

    private String apiKey;

    private String apiUrl;

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
