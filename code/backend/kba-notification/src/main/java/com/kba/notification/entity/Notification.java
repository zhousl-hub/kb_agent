package com.kba.notification.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 通知实体
 *
 * @author kba
 */
@Data
@TableName("notification")
public class Notification {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String type;

    private String title;

    private String content;

    private Long userId;

    private String status;

    private String readStatus;

    private LocalDateTime readAt;

    private String sendChannel;

    private String sendResult;

    private Long tenantId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
