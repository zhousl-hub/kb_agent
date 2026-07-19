-- ====================================
-- KBA Notification Service 数据库初始化脚本
-- MySQL 8.0 兼容
-- ====================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ==================== 使用数据库 ====================

USE kba_notification;

-- ==================== 通知模板表 ====================

CREATE TABLE IF NOT EXISTS notification_template (
    id BIGINT PRIMARY KEY COMMENT '模板ID (雪花ID)',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    code VARCHAR(50) NOT NULL COMMENT '模板编码',
    type VARCHAR(20) NOT NULL COMMENT '通知类型: EMAIL/SMS/WEBHOOK/PUSH/INBOX',
    title VARCHAR(200) COMMENT '模板标题',
    content TEXT NOT NULL COMMENT '模板内容',
    variables JSON COMMENT '变量定义',
    description VARCHAR(500) COMMENT '模板描述',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    created_by BIGINT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    UNIQUE KEY uk_tenant_code (tenant_id, code),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知模板表';

-- ==================== 通知记录表 ====================

CREATE TABLE IF NOT EXISTS notification (
    id BIGINT PRIMARY KEY COMMENT '通知ID (雪花ID)',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    template_id BIGINT COMMENT '模板ID',
    template_code VARCHAR(50) COMMENT '模板编码',
    user_id BIGINT NOT NULL COMMENT '接收用户ID',
    type VARCHAR(20) NOT NULL COMMENT '通知类型: EMAIL/SMS/WEBHOOK/PUSH/INBOX',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',
    channel VARCHAR(20) COMMENT '通知渠道: EMAIL/SMS/WEBHOOK/PUSH/INBOX',
    priority INT DEFAULT 0 COMMENT '优先级: 0-普通, 1-重要, 2-紧急',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态: PENDING/SENT/DELIVERED/READ/FAILED',
    retry_count INT DEFAULT 0 COMMENT '重试次数',
    max_retry INT DEFAULT 3 COMMENT '最大重试次数',
    sent_at TIMESTAMP NULL COMMENT '发送时间',
    delivered_at TIMESTAMP NULL COMMENT '送达时间',
    read_at TIMESTAMP NULL COMMENT '阅读时间',
    error_message TEXT COMMENT '错误信息',
    metadata JSON COMMENT '元数据',
    extra_data JSON COMMENT '扩展数据',
    created_by BIGINT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_template_id (template_id),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted (deleted),
    INDEX idx_user_status (user_id, status),
    INDEX idx_tenant_user (tenant_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知记录表';

-- ==================== 通知配置表 ====================

CREATE TABLE IF NOT EXISTS notification_config (
    id BIGINT PRIMARY KEY COMMENT '配置ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT COMMENT '用户ID (NULL表示全局配置)',
    config_type VARCHAR(50) NOT NULL COMMENT '配置类型: EMAIL/SMS/PUSH/INBOX',
    enabled TINYINT DEFAULT 1 COMMENT '是否启用',
    config_value JSON COMMENT '配置值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_tenant_user_type (tenant_id, user_id, config_type),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知配置表';

-- ==================== 通知发送日志表 ====================

CREATE TABLE IF NOT EXISTS notification_send_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    notification_id BIGINT NOT NULL COMMENT '通知ID',
    channel VARCHAR(20) NOT NULL COMMENT '发送渠道',
    status VARCHAR(20) NOT NULL COMMENT '状态: PENDING/SUCCESS/FAILED',
    request_data TEXT COMMENT '请求数据',
    response_data TEXT COMMENT '响应数据',
    error_message TEXT COMMENT '错误信息',
    duration INT COMMENT '耗时(毫秒)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_notification_id (notification_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知发送日志表';

-- ==================== 测试数据: 通知模板 (5条) ====================

INSERT INTO notification_template (id, tenant_id, name, code, type, title, content, variables, description, status, created_by) VALUES 
(1876543210000001, 1, '系统公告通知', 'SYSTEM_ANNOUNCEMENT', 'INBOX', '系统公告', 
'尊敬的用户：\n\n{{content}}\n\n此致\n{{systemName}}', 
'[{"name": "content", "type": "string", "required": true, "description": "公告内容"}, {"name": "systemName", "type": "string", "required": false, "default": "KBA知识管理平台", "description": "系统名称"}]', 
'系统公告通知模板，用于推送系统级公告消息', 1, 1),

(1876543210000002, 1, '密码重置邮件', 'PASSWORD_RESET', 'EMAIL', '【KBA】密码重置通知', 
'您好，{{username}}：\n\n您正在申请重置密码，验证码为：{{code}}\n\n验证码有效期为{{expireMinutes}}分钟，请尽快使用。\n\n如非本人操作，请忽略此邮件。\n\n此致\nKBA团队', 
'[{"name": "username", "type": "string", "required": true}, {"name": "code", "type": "string", "required": true}, {"name": "expireMinutes", "type": "number", "required": false, "default": 15}]', 
'密码重置邮件模板', 1, 1),

(1876543210000003, 1, '文档处理完成通知', 'DOCUMENT_PROCESSED', 'INBOX', '文档处理完成', 
'您的文档【{{documentName}}】已处理完成。\n\n处理结果：{{status}}\n分片数量：{{chunkCount}}\n\n点击查看详情', 
'[{"name": "documentName", "type": "string", "required": true}, {"name": "status", "type": "string", "required": true}, {"name": "chunkCount", "type": "number", "required": true}]', 
'知识文档处理完成后发送的通知模板', 1, 1),

(1876543210000004, 1, 'AI对话统计周报', 'AI_WEEKLY_REPORT', 'EMAIL', '【KBA】AI使用周报', 
'{{username}}，您好！\n\n以下是您本周的AI使用统计：\n\n📊 对话次数：{{chatCount}}次\n📝 提问数量：{{questionCount}}个\n⏱️ 总时长：{{totalDuration}}分钟\n💰 Token消耗：{{tokenUsage}}\n\n查看详细报告请登录系统。\n\n祝工作愉快！', 
'[{"name": "username", "type": "string", "required": true}, {"name": "chatCount", "type": "number", "required": true}, {"name": "questionCount", "type": "number", "required": true}, {"name": "totalDuration", "type": "number", "required": true}, {"name": "tokenUsage", "type": "string", "required": true}]', 
'AI对话使用统计周报邮件模板', 1, 1),

(1876543210000005, 1, '账户安全预警', 'SECURITY_ALERT', 'SMS', '【KBA】安全预警', 
'检测到您的账户存在异常登录，登录时间：{{loginTime}}，登录IP：{{loginIp}}。如非本人操作，请立即修改密码。', 
'[{"name": "loginTime", "type": "string", "required": true}, {"name": "loginIp", "type": "string", "required": true}]', 
'账户安全预警短信模板', 1, 1);

-- ==================== 测试数据: 通知记录 (10条) ====================

INSERT INTO notification (id, tenant_id, template_id, template_code, user_id, type, title, content, channel, priority, status, sent_at, read_at, metadata, created_by) VALUES 
(1867543210000001, 1, 1876543210000001, 'SYSTEM_ANNOUNCEMENT', 1, 'INBOX', '系统维护通知', 
'尊敬的用户：\n\n系统将于2024年1月15日凌晨2:00-6:00进行例行维护升级，届时系统将暂停服务。\n\n请提前做好相关安排，给您带来的不便敬请谅解。\n\n此致\nKBA知识管理平台', 
'INBOX', 1, 'READ', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 
'{"source": "system", "importance": "high"}', 1),

(1867543210000002, 1, 1876543210000002, 'PASSWORD_RESET', 2, 'EMAIL', '【KBA】密码重置通知', 
'您好，张三：\n\n您正在申请重置密码，验证码为：839451\n\n验证码有效期为15分钟，请尽快使用。\n\n如非本人操作，请忽略此邮件。\n\n此致\nKBA团队', 
'EMAIL', 0, 'SENT', DATE_SUB(NOW(), INTERVAL 3 DAY), NULL, 
'{"email": "zhangsan@kba.com", "codeExpireAt": "2024-01-12T15:30:00Z"}', 2),

(1867543210000003, 1, 1876543210000003, 'DOCUMENT_PROCESSED', 2, 'INBOX', '文档处理完成', 
'您的文档【智能客服系统产品说明书.pdf】已处理完成。\n\n处理结果：成功\n分片数量：128\n\n点击查看详情', 
'INBOX', 0, 'READ', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 
'{"documentId": 1, "knowledgeSpaceId": 1}', 2),

(1867543210000004, 1, 1876543210000003, 'DOCUMENT_PROCESSED', 3, 'INBOX', '文档处理完成', 
'您的文档【数据分析平台用户手册.docx】已处理完成。\n\n处理结果：成功\n分片数量：86\n\n点击查看详情', 
'INBOX', 0, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, 
'{"documentId": 2, "knowledgeSpaceId": 1}', 3),

(1867543210000005, 1, 1876543210000004, 'AI_WEEKLY_REPORT', 1, 'EMAIL', '【KBA】AI使用周报', 
'系统管理员，您好！\n\n以下是您本周的AI使用统计：\n\n📊 对话次数：156次\n📝 提问数量：342个\n⏱️ 总时长：428分钟\n💰 Token消耗：1,234,567\n\n查看详细报告请登录系统。\n\n祝工作愉快！', 
'EMAIL', 0, 'SENT', DATE_SUB(NOW(), INTERVAL 7 DAY), NULL, 
'{"weekStart": "2024-01-08", "weekEnd": "2024-01-14"}', 1),

(1867543210000006, 1, 1876543210000005, 'SECURITY_ALERT', 2, 'SMS', '【KBA】安全预警', 
'检测到您的账户存在异常登录，登录时间：2024-01-14 23:45:00，登录IP：192.168.100.88。如非本人操作，请立即修改密码。', 
'SMS', 2, 'SENT', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, 
'{"phone": "138****8002", "alertType": "ABNORMAL_LOGIN"}', 1),

(1867543210000007, 1, NULL, NULL, 4, 'INBOX', '新版本发布通知', 
'亲爱的用户：\n\nKBA v1.2.0版本已发布，新版本包含以下更新：\n\n✨ 新增知识图谱可视化功能\n✨ 支持多模型对比分析\n✨ 优化搜索结果排序算法\n🐛 修复若干已知问题\n\n立即体验新版本！', 
'INBOX', 1, 'DELIVERED', NOW(), NULL, 
'{"version": "1.2.0", "releaseNotes": "https://docs.kba.com/release/1.2.0"}', 1),

(1867543210000008, 1, NULL, NULL, 5, 'INBOX', '知识空间邀请', 
'您被邀请加入知识空间【产品文档知识库】，请及时处理。', 
'INBOX', 0, 'PENDING', NULL, NULL, 
'{"spaceId": 1, "spaceName": "产品文档知识库", "inviterId": 1, "inviterName": "系统管理员"}', 1),

(1867543210000009, 1, 1876543210000003, 'DOCUMENT_PROCESSED', 3, 'INBOX', '文档处理失败', 
'您的文档【测试数据.xlsx】处理失败。\n\n错误原因：文件格式不支持\n\n请检查文件格式后重试。', 
'INBOX', 1, 'READ', DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), 
'{"documentId": 999, "errorType": "UNSUPPORTED_FORMAT"}', 3),

(1867543210000010, 1, NULL, NULL, 6, 'INBOX', '账户权限变更通知', 
'您的账户角色已更新。\n\n新增角色：数据分析师\n\n如有疑问请联系管理员。', 
'INBOX', 0, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 12 HOUR), NULL, 
'{"oldRoles": ["USER"], "newRoles": ["USER", "DATA_ANALYST"], "operatorId": 1}', 1);

-- ==================== 测试数据: 通知配置 ====================

INSERT INTO notification_config (id, tenant_id, user_id, config_type, enabled, config_value) VALUES 
(1, 1, NULL, 'EMAIL', 1, '{"smtpHost": "smtp.kba.com", "smtpPort": 465, "from": "noreply@kba.com", "fromName": "KBA"}'),
(2, 1, NULL, 'SMS', 1, '{"provider": "tencent", "appId": "kba-sms", "signName": "KBA知识平台"}'),
(3, 1, NULL, 'PUSH', 1, '{"provider": "jpush", "appKey": "kba-push-key"}'),
(4, 1, NULL, 'INBOX', 1, '{"enableDesktop": true, "enableMobile": true}'),
(5, 1, 1, 'EMAIL', 1, '{"forwardTo": "admin@kba.com"}'),
(6, 1, 2, 'INBOX', 1, '{"quietHours": {"enabled": true, "start": "22:00", "end": "08:00"}}');

-- ==================== 测试数据: 发送日志 ====================

INSERT INTO notification_send_log (tenant_id, notification_id, channel, status, request_data, response_data, duration) VALUES 
(1, 1867543210000001, 'INBOX', 'SUCCESS', '{"type": "inbox", "userId": 1}', '{"messageId": "msg_001"}', 15),
(1, 1867543210000002, 'EMAIL', 'SUCCESS', '{"to": "zhangsan@kba.com", "subject": "密码重置通知"}', '{"messageId": "email_001", "accepted": ["zhangsan@kba.com"]}', 456),
(1, 1867543210000005, 'EMAIL', 'SUCCESS', '{"to": "admin@kba.com", "subject": "AI使用周报"}', '{"messageId": "email_002", "accepted": ["admin@kba.com"]}', 523),
(1, 1867543210000006, 'SMS', 'SUCCESS', '{"phone": "13800138002", "templateId": "sms_security_alert"}', '{"requestId": "sms_001", "code": "OK"}', 234);

-- ==================== 完成 ====================

SELECT 'Notification schema initialization completed!' AS message;