package com.kba.notification.controller;

import com.kba.notification.dto.NotificationSendRequest;
import com.kba.notification.dto.NotificationResponse;
import com.kba.notification.service.NotificationService;
import com.kba.common.core.result.R;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 通知控制器
 *
 * @author kba
 */
@Tag(name = "通知管理")
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "发送通知")
    @PostMapping("/send")
    public R<Void> sendNotification(@RequestBody NotificationSendRequest request) {
        notificationService.sendNotification(request);
        return R.ok();
    }

    @Operation(summary = "批量发送通知")
    @PostMapping("/batch-send")
    public R<Void> batchSendNotification(@RequestBody List<NotificationSendRequest> requests) {
        notificationService.batchSendNotification(requests);
        return R.ok();
    }

    @Operation(summary = "获取通知列表")
    @GetMapping
    public R<Map<String, Object>> listNotifications(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {
        return R.ok(notificationService.listNotifications(pageNum, pageSize, userId, type, status));
    }

    @Operation(summary = "获取通知详情")
    @GetMapping("/{id}")
    public R<NotificationResponse> getNotificationById(@PathVariable Long id) {
        return R.ok(notificationService.getNotificationById(id));
    }

    @Operation(summary = "标记通知已读")
    @PutMapping("/{id}/read")
    public R<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return R.ok();
    }

    @Operation(summary = "批量标记已读")
    @PutMapping("/batch-read")
    public R<Void> batchMarkAsRead(@RequestBody List<Long> ids) {
        notificationService.batchMarkAsRead(ids);
        return R.ok();
    }

    @Operation(summary = "删除通知")
    @DeleteMapping("/{id}")
    public R<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return R.ok();
    }

    @Operation(summary = "获取未读数量")
    @GetMapping("/unread-count")
    public R<Long> getUnreadCount(@RequestParam Long userId) {
        return R.ok(notificationService.getUnreadCount(userId));
    }

    @Operation(summary = "获取通知模板列表")
    @GetMapping("/templates")
    public R<List<Map<String, Object>>> listTemplates() {
        return R.ok(notificationService.listTemplates());
    }

    @Operation(summary = "创建通知模板")
    @PostMapping("/templates")
    public R<Void> createTemplate(@RequestBody Map<String, Object> template) {
        notificationService.createTemplate(template);
        return R.ok();
    }

    @Operation(summary = "更新通知模板")
    @PutMapping("/templates/{id}")
    public R<Void> updateTemplate(@PathVariable Long id, @RequestBody Map<String, Object> template) {
        notificationService.updateTemplate(id, template);
        return R.ok();
    }

    @Operation(summary = "删除通知模板")
    @DeleteMapping("/templates/{id}")
    public R<Void> deleteTemplate(@PathVariable Long id) {
        notificationService.deleteTemplate(id);
        return R.ok();
    }
}
