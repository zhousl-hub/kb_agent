package com.kba.notification.dto;

import lombok.Data;

import java.util.Map;

/**
 * 通知发送请求
 *
 * @author kba
 */
@Data
public class NotificationSendRequest {

    private String type;

    private String title;

    private String content;

    private Long userId;

    private String email;

    private String phone;

    private String templateCode;

    private Map<String, Object> templateParams;

    private Long tenantId;

    private Integer priority;
}
