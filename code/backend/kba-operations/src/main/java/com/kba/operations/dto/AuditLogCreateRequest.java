package com.kba.operations.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 审计日志创建请求
 *
 * @author kba
 */
@Data
public class AuditLogCreateRequest {

    private String module;

    private String action;

    private String resourceType;

    private Long resourceId;

    private String resourceName;

    private Long userId;

    private String username;

    private String ip;

    private String userAgent;

    private String requestMethod;

    private String requestUrl;

    private String requestParams;

    private Integer responseStatus;

    private String responseMsg;

    private Long duration;

    private Long tenantId;

    private LocalDateTime createdAt;
}
