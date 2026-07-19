package com.kba.knowledge.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 报告实体
 *
 * @author kba
 */
@Data
@TableName("report")
public class Report {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String title;

    private String content;

    private String status;

    private Integer version;

    private Long authorId;

    private String authorName;

    private Long departmentId;

    private String departmentName;

    private String tags;

    private LocalDateTime publishedAt;

    private Long tenantId;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
