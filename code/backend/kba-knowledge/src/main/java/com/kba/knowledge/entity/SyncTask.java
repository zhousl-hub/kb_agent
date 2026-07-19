package com.kba.knowledge.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 同步任务实体
 *
 * @author kba
 */
@Data
@TableName("sync_task")
public class SyncTask {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long dataSourceId;

    private String status;

    private Integer totalDocs;

    private Integer processedDocs;

    private Integer failedDocs;

    private String errorMessage;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private Long tenantId;

    private Long createdBy;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
