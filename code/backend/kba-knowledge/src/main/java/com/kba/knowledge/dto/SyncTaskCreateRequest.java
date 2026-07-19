package com.kba.knowledge.dto;

import lombok.Data;

/**
 * 同步任务创建请求
 *
 * @author kba
 */
@Data
public class SyncTaskCreateRequest {

    private Long dataSourceId;

    private Boolean fullSync = false;
}
