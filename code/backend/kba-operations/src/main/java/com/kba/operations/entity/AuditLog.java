package com.kba.operations.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 审计日志实体
 *
 * @author kba
 */
@Data
@TableName("audit_log")
public class AuditLog {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

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

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
