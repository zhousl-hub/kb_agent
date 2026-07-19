package com.kba.notification.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.common.core.exception.BusinessException;
import com.kba.notification.dto.NotificationSendRequest;
import com.kba.notification.dto.NotificationResponse;
import com.kba.notification.service.EmailService;
import com.kba.notification.service.NotificationService;
import com.kba.notification.service.SmsService;
import com.kba.notification.entity.Notification;
import com.kba.notification.entity.NotificationTemplate;
import com.kba.notification.mapper.NotificationMapper;
import com.kba.notification.mapper.NotificationTemplateMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationMapper notificationMapper;
    private final NotificationTemplateMapper templateMapper;
    private final EmailService emailService;
    private final SmsService smsService;

    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_SENT = "sent";
    private static final String STATUS_FAILED = "failed";
    private static final String READ_STATUS_UNREAD = "unread";
    private static final String READ_STATUS_READ = "read";

    @Override
    @Transactional
    public void sendNotification(NotificationSendRequest request) {
        Notification notification = createNotification(request);
        
        try {
            String sendChannel = determineSendChannel(request);
            notification.setSendChannel(sendChannel);
            
            if ("email".equals(sendChannel) && request.getEmail() != null) {
                sendEmailNotification(request, notification);
            } else if ("sms".equals(sendChannel) && request.getPhone() != null) {
                sendSmsNotification(request, notification);
            } else {
                notification.setStatus(STATUS_SENT);
                notification.setSendResult("站内信发送成功");
            }
        } catch (Exception e) {
            log.error("通知发送失败: userId={}, type={}", request.getUserId(), request.getType(), e);
            notification.setStatus(STATUS_FAILED);
            notification.setSendResult("发送失败: " + e.getMessage());
        }
        
        // 原仓储 save 逻辑：无主键则插入，否则更新
        if (notification.getId() == null) {
            notificationMapper.insert(notification);
        } else {
            notificationMapper.updateById(notification);
        }
    }

    @Override
    @Transactional
    public void batchSendNotification(List<NotificationSendRequest> requests) {
        for (NotificationSendRequest request : requests) {
            try {
                sendNotification(request);
            } catch (Exception e) {
                log.error("批量发送通知失败: userId={}", request.getUserId(), e);
            }
        }
    }

    @Override
    public Map<String, Object> listNotifications(int pageNum, int pageSize, Long userId, String type, String status) {
        // 原仓储 findByUserId 逻辑：按用户及类型、状态分页查询
        Page<Notification> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getUserId, userId);
        if (type != null && !type.isEmpty()) {
            wrapper.eq(Notification::getType, type);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Notification::getStatus, status);
        }
        wrapper.orderByDesc(Notification::getCreatedAt);
        page = notificationMapper.selectPage(page, wrapper);
        
        List<NotificationResponse> list = page.getRecords().stream()
                .map(this::toNotificationResponse)
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", page.getTotal());
        result.put("pageNum", page.getCurrent());
        result.put("pageSize", page.getSize());
        result.put("pages", page.getPages());
        return result;
    }

    @Override
    public NotificationResponse getNotificationById(Long id) {
        Notification notification = notificationMapper.selectById(id);
        if (notification == null) {
            throw new BusinessException(404, "通知不存在");
        }
        return toNotificationResponse(notification);
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationMapper.selectById(id);
        if (notification == null) {
            throw new BusinessException(404, "通知不存在");
        }
        notification.setReadStatus(READ_STATUS_READ);
        notification.setReadAt(LocalDateTime.now());
        notificationMapper.updateById(notification);
    }

    @Override
    @Transactional
    public void batchMarkAsRead(List<Long> ids) {
        // 原仓储 markAsReadByIds 逻辑：批量将指定通知标记为已读
        if (ids == null || ids.isEmpty()) {
            return;
        }
        LambdaUpdateWrapper<Notification> wrapper = new LambdaUpdateWrapper<>();
        wrapper.in(Notification::getId, ids)
                .set(Notification::getReadStatus, READ_STATUS_READ)
                .set(Notification::getReadAt, LocalDateTime.now());
        notificationMapper.update(null, wrapper);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        Notification notification = notificationMapper.selectById(id);
        if (notification == null) {
            throw new BusinessException(404, "通知不存在");
        }
        notificationMapper.deleteById(id);
    }

    @Override
    public Long getUnreadCount(Long userId) {
        // 原仓储 countUnreadByUserId 逻辑：统计用户未读通知数量
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getUserId, userId)
                .eq(Notification::getReadStatus, READ_STATUS_UNREAD);
        return notificationMapper.selectCount(wrapper);
    }

    @Override
    public List<Map<String, Object>> listTemplates() {
        List<NotificationTemplate> templates = templateMapper.selectList(null);
        return templates.stream()
                .map(this::toTemplateMap)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void createTemplate(Map<String, Object> template) {
        NotificationTemplate entity = new NotificationTemplate();
        entity.setCode((String) template.get("code"));
        entity.setName((String) template.get("name"));
        entity.setType((String) template.get("type"));
        entity.setTitle((String) template.get("title"));
        entity.setContent((String) template.get("content"));
        entity.setDescription((String) template.get("description"));
        entity.setStatus((Integer) template.getOrDefault("status", 1));
        entity.setTenantId(template.get("tenantId") != null ? Long.valueOf(template.get("tenantId").toString()) : null);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        templateMapper.insert(entity);
    }

    @Override
    @Transactional
    public void updateTemplate(Long id, Map<String, Object> template) {
        NotificationTemplate entity = templateMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(404, "模板不存在");
        }
        if (template.containsKey("name")) {
            entity.setName((String) template.get("name"));
        }
        if (template.containsKey("title")) {
            entity.setTitle((String) template.get("title"));
        }
        if (template.containsKey("content")) {
            entity.setContent((String) template.get("content"));
        }
        if (template.containsKey("description")) {
            entity.setDescription((String) template.get("description"));
        }
        if (template.containsKey("status")) {
            entity.setStatus((Integer) template.get("status"));
        }
        entity.setUpdatedAt(LocalDateTime.now());
        templateMapper.updateById(entity);
    }

    @Override
    @Transactional
    public void deleteTemplate(Long id) {
        NotificationTemplate template = templateMapper.selectById(id);
        if (template == null) {
            throw new BusinessException(404, "模板不存在");
        }
        templateMapper.deleteById(id);
    }

    private Notification createNotification(NotificationSendRequest request) {
        Notification notification = new Notification();
        notification.setType(request.getType());
        notification.setTitle(request.getTitle());
        notification.setContent(request.getContent());
        notification.setUserId(request.getUserId());
        notification.setStatus(STATUS_PENDING);
        notification.setReadStatus(READ_STATUS_UNREAD);
        notification.setTenantId(request.getTenantId());
        notification.setCreatedAt(LocalDateTime.now());
        return notification;
    }

    private String determineSendChannel(NotificationSendRequest request) {
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            return "email";
        }
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            return "sms";
        }
        return "inbox";
    }

    private void sendEmailNotification(NotificationSendRequest request, Notification notification) {
        try {
            if (request.getTemplateCode() != null) {
                emailService.sendEmailWithTemplate(request.getEmail(), request.getTemplateCode(), 
                        request.getTemplateParams() != null ? request.getTemplateParams() : new HashMap<>());
            } else {
                emailService.sendEmail(request.getEmail(), request.getTitle(), request.getContent());
            }
            notification.setStatus(STATUS_SENT);
            notification.setSendResult("邮件发送成功");
        } catch (Exception e) {
            log.error("邮件发送失败: email={}", request.getEmail(), e);
            notification.setStatus(STATUS_FAILED);
            notification.setSendResult("邮件发送失败: " + e.getMessage());
            throw new BusinessException(500, "邮件发送失败: " + e.getMessage());
        }
    }

    private void sendSmsNotification(NotificationSendRequest request, Notification notification) {
        try {
            if (request.getTemplateCode() != null) {
                smsService.sendSmsWithTemplate(request.getPhone(), request.getTemplateCode(),
                        request.getTemplateParams() != null ? request.getTemplateParams() : new HashMap<>());
            } else {
                smsService.sendSms(request.getPhone(), request.getContent());
            }
            notification.setStatus(STATUS_SENT);
            notification.setSendResult("短信发送成功");
        } catch (Exception e) {
            log.error("短信发送失败: phone={}", request.getPhone(), e);
            notification.setStatus(STATUS_FAILED);
            notification.setSendResult("短信发送失败: " + e.getMessage());
            throw new BusinessException(500, "短信发送失败: " + e.getMessage());
        }
    }

    private NotificationResponse toNotificationResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setType(notification.getType());
        response.setTitle(notification.getTitle());
        response.setContent(notification.getContent());
        response.setUserId(notification.getUserId());
        response.setStatus(notification.getStatus());
        response.setReadStatus(notification.getReadStatus());
        response.setReadAt(notification.getReadAt());
        response.setSendChannel(notification.getSendChannel());
        response.setSendResult(notification.getSendResult());
        response.setTenantId(notification.getTenantId());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }

    private Map<String, Object> toTemplateMap(NotificationTemplate template) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", template.getId());
        map.put("code", template.getCode());
        map.put("name", template.getName());
        map.put("type", template.getType());
        map.put("title", template.getTitle());
        map.put("content", template.getContent());
        map.put("description", template.getDescription());
        map.put("status", template.getStatus());
        map.put("tenantId", template.getTenantId());
        map.put("createdAt", template.getCreatedAt());
        map.put("updatedAt", template.getUpdatedAt());
        return map;
    }
}
