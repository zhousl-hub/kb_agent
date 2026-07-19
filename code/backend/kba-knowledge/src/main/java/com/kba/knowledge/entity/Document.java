package com.kba.knowledge.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文档实体
 *
 * @author kba
 */
@Data
@TableName("kb_document")
public class Document {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    @TableField("knowledge_space_id")
    private Long knowledgeId;

    private String type;

    private Long size;

    private String status;

    private Integer chunkCount;

    private String filePath;

    private Long tenantId;

    private Long createdBy;

    @TableField("deleted_at")
    private LocalDateTime deletedAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
