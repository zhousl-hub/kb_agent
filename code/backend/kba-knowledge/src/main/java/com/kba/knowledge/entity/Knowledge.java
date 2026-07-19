package com.kba.knowledge.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 知识库实体
 *
 * @author kba
 */
@Data
@TableName("kb_knowledge_space")
public class Knowledge {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String description;

    private String icon;

    @TableField("document_count")
    private Integer documentCount;

    @TableField(exist = false)
    private Long spaceId;

    private Long tenantId;

    private Long createdBy;

    @TableField("deleted_at")
    private LocalDateTime deletedAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
