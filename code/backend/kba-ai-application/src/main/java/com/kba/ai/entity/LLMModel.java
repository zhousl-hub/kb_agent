package com.kba.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * LLM模型实体
 *
 * @author kba
 */
@Data
@TableName("ai_llm_model")
public class LLMModel {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String name;

    private String provider;

    private String modelName;

    private String apiKey;

    private String apiEndpoint;

    private Integer maxTokens;

    private Double temperature;

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
