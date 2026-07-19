package com.kba.notification.service;

import com.kba.notification.dto.NotificationSendRequest;
import com.kba.notification.dto.NotificationResponse;

import java.util.List;
import java.util.Map;

/**
 * 通知服务接口
 *
 * @author kba
 */
public interface NotificationService {

    void sendNotification(NotificationSendRequest request);

    void batchSendNotification(List<NotificationSendRequest> requests);

    Map<String, Object> listNotifications(int pageNum, int pageSize, Long userId, String type, String status);

    NotificationResponse getNotificationById(Long id);

    void markAsRead(Long id);

    void batchMarkAsRead(List<Long> ids);

    void deleteNotification(Long id);

    Long getUnreadCount(Long userId);

    List<Map<String, Object>> listTemplates();

    void createTemplate(Map<String, Object> template);

    void updateTemplate(Long id, Map<String, Object> template);

    void deleteTemplate(Long id);
}
