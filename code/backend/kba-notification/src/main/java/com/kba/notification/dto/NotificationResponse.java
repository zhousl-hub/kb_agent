package com.kba.notification.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 通知响应
 *
 * @author kba
 */
@Data
public class NotificationResponse {

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

    private LocalDateTime createdAt;
}
