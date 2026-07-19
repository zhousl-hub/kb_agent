package com.kba.knowledge.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 同步任务响应
 *
 * @author kba
 */
@Data
public class SyncTaskResponse {

    private Long id;

    private Long dataSourceId;

    private String status;

    private Integer totalDocs;

    private Integer processedDocs;

    private Integer failedDocs;

    private String errorMessage;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;
}
