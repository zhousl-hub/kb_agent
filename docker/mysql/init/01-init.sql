-- ====================================
-- KBA 微服务数据库初始化脚本
-- ====================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ==================== 创建数据库 ====================

-- Nacos 注册中心
CREATE DATABASE IF NOT EXISTS nacos DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Keycloak 身份认证
CREATE DATABASE IF NOT EXISTS keycloak DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Identity Service - 身份认证服务
CREATE DATABASE IF NOT EXISTS kba_identity DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Knowledge Service - 知识管理服务
CREATE DATABASE IF NOT EXISTS kba_knowledge DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AI Application Service - AI应用服务
CREATE DATABASE IF NOT EXISTS kba_ai DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Operations Service - 运维服务
CREATE DATABASE IF NOT EXISTS kba_ops DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Notification Service - 通知服务
CREATE DATABASE IF NOT EXISTS kba_notification DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- File Service - 文件服务
CREATE DATABASE IF NOT EXISTS kba_file DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Dify LLM Platform（Dify 自带 PostgreSQL，此库仅为可选兼容保留）
CREATE DATABASE IF NOT EXISTS dify DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==================== 授权 ====================

-- 创建 kba 用户
CREATE USER IF NOT EXISTS 'kba'@'%' IDENTIFIED BY 'kba123456';

-- 授权所有数据库
GRANT ALL PRIVILEGES ON nacos.* TO 'kba'@'%';
GRANT ALL PRIVILEGES ON keycloak.* TO 'kba'@'%';
GRANT ALL PRIVILEGES ON kba_identity.* TO 'kba'@'%';
GRANT ALL PRIVILEGES ON kba_knowledge.* TO 'kba'@'%';
GRANT ALL PRIVILEGES ON kba_ai.* TO 'kba'@'%';
GRANT ALL PRIVILEGES ON kba_ops.* TO 'kba'@'%';
GRANT ALL PRIVILEGES ON kba_notification.* TO 'kba'@'%';
GRANT ALL PRIVILEGES ON kba_file.* TO 'kba'@'%';
GRANT ALL PRIVILEGES ON dify.* TO 'kba'@'%';

FLUSH PRIVILEGES;

-- ==================== Identity Service 表结构 ====================

USE kba_identity;

-- 租户表
CREATE TABLE IF NOT EXISTS sys_tenant (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '租户ID',
    name VARCHAR(100) NOT NULL COMMENT '租户名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '租户编码',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    config JSON COMMENT '租户配置',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
    INDEX idx_code (code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租户表';

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(500) COMMENT '头像URL',
    dept_id BIGINT DEFAULT NULL COMMENT '部门ID',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
    UNIQUE KEY uk_tenant_username (tenant_id, username),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    name VARCHAR(50) NOT NULL COMMENT '角色名称',
    code VARCHAR(50) NOT NULL COMMENT '角色编码',
    description VARCHAR(255) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
    UNIQUE KEY uk_tenant_code (tenant_id, code),
    INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS sys_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '权限ID',
    name VARCHAR(50) NOT NULL COMMENT '权限名称',
    code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
    resource VARCHAR(255) COMMENT '资源标识',
    action VARCHAR(50) COMMENT '操作类型',
    description VARCHAR(255) COMMENT '权限描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS sys_role_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_permission (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 菜单表
CREATE TABLE IF NOT EXISTS sys_menu (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '菜单ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父菜单ID',
    name VARCHAR(50) NOT NULL COMMENT '菜单名称',
    path VARCHAR(255) COMMENT '路由路径',
    icon VARCHAR(100) COMMENT '图标',
    sort INT DEFAULT 0 COMMENT '排序',
    visible TINYINT DEFAULT 1 COMMENT '是否可见',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单表';

-- 部门表
CREATE TABLE IF NOT EXISTS sys_dept (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '部门ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    parent_id BIGINT DEFAULT 0 COMMENT '父部门ID',
    name VARCHAR(50) NOT NULL COMMENT '部门名称',
    code VARCHAR(50) COMMENT '部门编码',
    sort INT DEFAULT 0 COMMENT '排序',
    leader VARCHAR(50) COMMENT '负责人',
    phone VARCHAR(20) COMMENT '联系电话',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- ==================== Knowledge Service 表结构 ====================

USE kba_knowledge;

-- 数据源表
CREATE TABLE IF NOT EXISTS kb_data_source (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '数据源ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    name VARCHAR(100) NOT NULL COMMENT '数据源名称',
    type VARCHAR(50) NOT NULL COMMENT '数据源类型: LOCAL/DB/CONFLUENCE/DINGTALK/FEISHU',
    config JSON COMMENT '数据源配置',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_by BIGINT COMMENT '创建人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据源表';

-- 同步任务表
CREATE TABLE IF NOT EXISTS kb_sync_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '任务ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    data_source_id BIGINT NOT NULL COMMENT '数据源ID',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态: PENDING/RUNNING/SUCCESS/FAILED',
    progress INT DEFAULT 0 COMMENT '进度',
    total_count INT DEFAULT 0 COMMENT '总数',
    success_count INT DEFAULT 0 COMMENT '成功数',
    failed_count INT DEFAULT 0 COMMENT '失败数',
    error_message TEXT COMMENT '错误信息',
    started_at TIMESTAMP NULL COMMENT '开始时间',
    finished_at TIMESTAMP NULL COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_data_source_id (data_source_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='同步任务表';

-- 知识表
CREATE TABLE IF NOT EXISTS kb_knowledge (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '知识ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    data_source_id BIGINT COMMENT '数据源ID',
    title VARCHAR(500) NOT NULL COMMENT '标题',
    content LONGTEXT COMMENT '内容',
    summary TEXT COMMENT '摘要',
    file_path VARCHAR(500) COMMENT '文件路径',
    file_type VARCHAR(50) COMMENT '文件类型',
    file_size BIGINT COMMENT '文件大小',
    metadata JSON COMMENT '元数据',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_by BIGINT COMMENT '创建人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_data_source_id (data_source_id),
    FULLTEXT INDEX ft_title_content (title, content) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识表';

-- 知识分片表
CREATE TABLE IF NOT EXISTS kb_chunk (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分片ID',
    knowledge_id BIGINT NOT NULL COMMENT '知识ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    content TEXT NOT NULL COMMENT '分片内容',
    vector_id VARCHAR(100) COMMENT '向量ID',
    chunk_index INT COMMENT '分片索引',
    metadata JSON COMMENT '元数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_knowledge_id (knowledge_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_vector_id (vector_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识分片表';

-- ==================== AI Application Service 表结构 ====================

USE kba_ai;

-- AI应用表
CREATE TABLE IF NOT EXISTS ai_app (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '应用ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    name VARCHAR(100) NOT NULL COMMENT '应用名称',
    description VARCHAR(500) COMMENT '应用描述',
    type VARCHAR(20) NOT NULL COMMENT '应用类型: CHATBOT/WORKFLOW/AGENT',
    dify_app_id VARCHAR(100) COMMENT 'Dify应用ID',
    model_id BIGINT COMMENT '关联模型ID',
    config JSON COMMENT '应用配置',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-下线, 1-上线',
    created_by BIGINT COMMENT '创建人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI应用表';

-- 对话会话表
CREATE TABLE IF NOT EXISTS ai_chat_session (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    app_id BIGINT NOT NULL COMMENT '应用ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    title VARCHAR(200) COMMENT '会话标题',
    context JSON COMMENT '会话上下文',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_app_id (app_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话会话表';

-- 对话消息表
CREATE TABLE IF NOT EXISTS ai_chat_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
    session_id BIGINT NOT NULL COMMENT '会话ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    role VARCHAR(20) NOT NULL COMMENT '角色: USER/ASSISTANT/SYSTEM',
    content TEXT NOT NULL COMMENT '消息内容',
    `references` JSON COMMENT '引用来源',
    tokens INT DEFAULT 0 COMMENT 'Token数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话消息表';

-- 大语言模型表
CREATE TABLE IF NOT EXISTS ai_llm_model (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '模型ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    name VARCHAR(100) NOT NULL COMMENT '模型名称',
    provider VARCHAR(50) NOT NULL COMMENT '提供商: OPENAI/AZURE/ANTHROPIC/LOCAL',
    model_type VARCHAR(100) COMMENT '模型类型',
    config JSON COMMENT '模型配置',
    quota_limit BIGINT DEFAULT 0 COMMENT '配额限制',
    quota_used BIGINT DEFAULT 0 COMMENT '已用配额',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_provider (provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='大语言模型表';

-- ==================== Operations Service 表结构 ====================

USE kba_ops;

-- 审计日志表
CREATE TABLE IF NOT EXISTS ops_audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    action VARCHAR(50) NOT NULL COMMENT '操作类型',
    resource VARCHAR(255) COMMENT '资源标识',
    method VARCHAR(10) COMMENT '请求方法',
    url VARCHAR(500) COMMENT '请求URL',
    ip VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT 'User-Agent',
    request_body TEXT COMMENT '请求体',
    response_code INT COMMENT '响应码',
    duration INT COMMENT '耗时(ms)',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-失败, 1-成功',
    error_message TEXT COMMENT '错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS ops_system_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    config_key VARCHAR(100) NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type VARCHAR(50) COMMENT '配置类型',
    description VARCHAR(255) COMMENT '配置描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_tenant_key (tenant_id, config_key),
    INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- ==================== 初始数据 ====================

USE kba_identity;

-- 默认租户
INSERT INTO sys_tenant (id, name, code, status) VALUES 
(1, '默认租户', 'default', 1);

-- 默认管理员 (密码: admin123, BCrypt加密)
INSERT INTO sys_user (id, tenant_id, username, email, password_hash, nickname, status) VALUES 
(1, 1, 'admin', 'admin@kba.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.eG1H2DkKsQPmPLF9E.', '系统管理员', 1);

-- 默认角色
INSERT INTO sys_role (id, tenant_id, name, code, description, status) VALUES 
(1, 1, '超级管理员', 'SUPER_ADMIN', '拥有所有权限', 1),
(2, 1, '管理员', 'ADMIN', '管理权限', 1),
(3, 1, '普通用户', 'USER', '普通用户权限', 1);

-- 用户角色关联
INSERT INTO sys_user_role (user_id, role_id) VALUES (1, 1);

-- 默认权限
INSERT INTO sys_permission (name, code, resource, action, description) VALUES 
('用户管理', 'system:user:list', '/api/v1/users', 'GET', '查看用户列表'),
('用户创建', 'system:user:create', '/api/v1/users', 'POST', '创建用户'),
('用户更新', 'system:user:update', '/api/v1/users/*', 'PUT', '更新用户'),
('用户删除', 'system:user:delete', '/api/v1/users/*', 'DELETE', '删除用户'),
('角色管理', 'system:role:list', '/api/v1/roles', 'GET', '查看角色列表'),
('知识管理', 'knowledge:manage', '/api/v1/knowledge/**', '*', '知识管理权限'),
('AI应用管理', 'ai:app:manage', '/api/v1/apps/**', '*', 'AI应用管理权限');

-- 角色权限关联 (超级管理员拥有所有权限)
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 1, id FROM sys_permission;

-- 默认菜单
INSERT INTO sys_menu (id, parent_id, name, path, icon, sort, visible, status) VALUES 
(1, 0, '概览', '/dashboard', 'Dashboard', 1, 1, 1),
(2, 0, '知识管理', '/knowledge', 'Book', 2, 1, 1),
(3, 2, '知识接入', '/knowledge/access', 'Upload', 1, 1, 1),
(4, 2, '知识加工', '/knowledge/process', 'Process', 2, 1, 1),
(5, 0, 'AI管理', '/ai', 'Robot', 3, 1, 1),
(6, 5, '模型管理', '/ai/model', 'Model', 1, 1, 1),
(7, 5, '应用管理', '/ai/app', 'App', 2, 1, 1),
(8, 0, '系统管理', '/system', 'Setting', 4, 1, 1),
(9, 8, '用户管理', '/system/user', 'User', 1, 1, 1),
(10, 8, '角色权限', '/system/role', 'Role', 2, 1, 1),
(11, 8, '监控统计', '/system/monitor', 'Monitor', 3, 1, 1),
(12, 8, '安全审计', '/system/audit', 'Security', 4, 1, 1),
(13, 8, '系统设置', '/system/settings', 'Config', 5, 1, 1);

-- 默认部门
INSERT INTO sys_dept (id, tenant_id, parent_id, name, code, sort, status) VALUES 
(1, 1, 0, '总公司', 'HQ', 0, 1),
(2, 1, 1, '研发部', 'RD', 1, 1),
(3, 1, 1, '产品部', 'PD', 2, 1),
(4, 1, 1, '运营部', 'OP', 3, 1);

USE kba_ops;

-- 默认系统配置
INSERT INTO ops_system_config (tenant_id, config_key, config_value, config_type, description) VALUES 
(0, 'system.name', 'KBA企业级知识管理平台', 'STRING', '系统名称'),
(0, 'system.logo', '/assets/logo.png', 'STRING', '系统Logo'),
(0, 'file.upload.maxSize', '104857600', 'NUMBER', '文件上传最大大小(字节)'),
(0, 'file.upload.allowedTypes', 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,md', 'STRING', '允许上传的文件类型'),
(0, 'ai.chat.maxTokens', '4096', 'NUMBER', '对话最大Token数'),
(0, 'ai.chat.temperature', '0.7', 'NUMBER', '对话温度参数');

-- ==================== 完成 ====================

SELECT 'Database initialization completed!' AS message;
SELECT 'Database initialization completed!' AS message;