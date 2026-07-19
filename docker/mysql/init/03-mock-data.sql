-- ====================================
-- KBA Mock Data Initialization Script
-- 前端 Mock 数据持久化
-- ====================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ==================== kba_identity ====================

USE kba_identity;

-- 额外用户 (密码: User@123, BCrypt加密)
INSERT IGNORE INTO sys_user (id, tenant_id, username, email, phone, password_hash, nickname, dept_id, status) VALUES 
(2, 1, 'zhangsan', 'zhangsan@kba.com', '13800138002', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '张三', 2, 1),
(3, 1, 'lisi', 'lisi@kba.com', '13800138003', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '李四', 3, 1),
(4, 1, 'wangwu', 'wangwu@kba.com', '13800138004', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '王五', 4, 1),
(5, 1, 'zhaoliu', 'zhaoliu@kba.com', '13800138005', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '赵六', 2, 1),
(6, 1, 'sunqi', 'sunqi@kba.com', '13800138006', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '孙七', 5, 1);

-- 更多角色
INSERT IGNORE INTO sys_role (id, tenant_id, name, code, description, status) VALUES 
(4, 1, '知识管理员', 'KNOWLEDGE_ADMIN', '知识库管理权限', 1),
(5, 1, 'AI应用管理员', 'AI_ADMIN', 'AI应用管理权限', 1),
(6, 1, '运营人员', 'OPERATOR', '运营相关权限', 1),
(7, 1, '访客', 'GUEST', '只读访问权限', 1),
(8, 1, '数据分析师', 'DATA_ANALYST', '数据分析权限', 1);

-- 用户角色关联
INSERT IGNORE INTO sys_user_role (user_id, role_id) VALUES 
(2, 3),
(2, 4),
(3, 3),
(3, 6),
(4, 3),
(4, 5),
(5, 3),
(6, 3),
(6, 8);

-- 更多权限
INSERT IGNORE INTO sys_permission (name, code, resource, action, description) VALUES 
('知识空间管理', 'knowledge:space:manage', '/api/v1/knowledge/spaces/**', '*', '知识空间管理权限'),
('文档上传', 'knowledge:document:upload', '/api/v1/knowledge/documents/upload', 'POST', '上传文档权限'),
('文档删除', 'knowledge:document:delete', '/api/v1/knowledge/documents/*', 'DELETE', '删除文档权限'),
('文档查看', 'knowledge:document:view', '/api/v1/knowledge/documents/**', 'GET', '查看文档权限'),
('AI模型配置', 'ai:model:config', '/api/v1/ai/models/**', '*', 'AI模型配置权限'),
('AI应用创建', 'ai:app:create', '/api/v1/ai/apps', 'POST', '创建AI应用权限'),
('AI应用删除', 'ai:app:delete', '/api/v1/ai/apps/*', 'DELETE', '删除AI应用权限'),
('对话管理', 'ai:chat:manage', '/api/v1/ai/chat/**', '*', '对话管理权限'),
('系统监控', 'system:monitor:view', '/api/v1/system/monitor/**', 'GET', '系统监控查看权限'),
('审计日志查看', 'system:audit:view', '/api/v1/system/audit/**', 'GET', '审计日志查看权限'),
('配置管理', 'system:config:manage', '/api/v1/system/config/**', '*', '系统配置管理权限'),
('数据统计', 'data:statistics:view', '/api/v1/statistics/**', 'GET', '数据统计查看权限'),
('数据导出', 'data:export', '/api/v1/export/**', 'GET', '数据导出权限'),
('部门管理', 'system:dept:manage', '/api/v1/system/depts/**', '*', '部门管理权限'),
('菜单管理', 'system:menu:manage', '/api/v1/system/menus/**', '*', '菜单管理权限');

-- 角色权限关联 (知识管理员)
INSERT IGNORE INTO sys_role_permission (role_id, permission_id) 
SELECT 4, id FROM sys_permission WHERE code IN (
    'knowledge:space:manage', 'knowledge:document:upload', 
    'knowledge:document:delete', 'knowledge:document:view',
    'knowledge:manage', 'data:statistics:view'
);

-- 角色权限关联 (AI应用管理员)
INSERT IGNORE INTO sys_role_permission (role_id, permission_id) 
SELECT 5, id FROM sys_permission WHERE code IN (
    'ai:model:config', 'ai:app:create', 'ai:app:delete', 
    'ai:app:manage', 'ai:chat:manage', 'data:statistics:view'
);

-- 角色权限关联 (运营人员)
INSERT IGNORE INTO sys_role_permission (role_id, permission_id) 
SELECT 6, id FROM sys_permission WHERE code IN (
    'knowledge:document:view', 'data:statistics:view', 'data:export'
);

-- 角色权限关联 (访客)
INSERT IGNORE INTO sys_role_permission (role_id, permission_id) 
SELECT 7, id FROM sys_permission WHERE code IN (
    'knowledge:document:view'
);

-- 角色权限关联 (数据分析师)
INSERT IGNORE INTO sys_role_permission (role_id, permission_id) 
SELECT 8, id FROM sys_permission WHERE code IN (
    'knowledge:document:view', 'data:statistics:view', 'data:export'
);

-- 完整菜单树
DELETE FROM sys_menu;
INSERT IGNORE INTO sys_menu (id, parent_id, name, path, icon, sort, visible, status) VALUES 
(1, 0, '工作台', '/dashboard', 'HomeFilled', 1, 1, 1),
(2, 0, '知识管理', '/knowledge', 'Collection', 2, 1, 1),
(3, 2, '知识空间', '/knowledge/spaces', 'FolderOpened', 1, 1, 1),
(4, 2, '文档管理', '/knowledge/documents', 'Document', 2, 1, 1),
(5, 2, '数据源管理', '/knowledge/datasources', 'Connection', 3, 1, 1),
(6, 2, '同步任务', '/knowledge/sync', 'Refresh', 4, 1, 1),
(7, 2, '分段策略', '/knowledge/chunks', 'Grid', 5, 1, 1),
(8, 2, '知识标签', '/knowledge/tags', 'PriceTag', 6, 1, 1),
(9, 0, 'AI应用', '/ai', 'Cpu', 3, 1, 1),
(10, 9, '智能助手', '/ai/assistants', 'ChatDotRound', 1, 1, 1),
(11, 9, '对话记录', '/ai/conversations', 'ChatLineRound', 2, 1, 1),
(12, 9, '模型管理', '/ai/models', 'Opportunity', 3, 1, 1),
(13, 9, '应用配置', '/ai/apps', 'Setting', 4, 1, 1),
(14, 9, '提示词管理', '/ai/prompts', 'EditPen', 5, 1, 1),
(15, 0, '数据分析', '/analysis', 'DataAnalysis', 4, 1, 1),
(16, 15, '使用统计', '/analysis/usage', 'TrendCharts', 1, 1, 1),
(17, 15, '知识统计', '/analysis/knowledge', 'DataBoard', 2, 1, 1),
(18, 15, 'AI统计', '/analysis/ai', 'DataLine', 3, 1, 1),
(19, 15, '报表中心', '/analysis/reports', 'Document', 4, 1, 1),
(20, 0, '系统管理', '/system', 'Setting', 5, 1, 1),
(21, 20, '用户管理', '/system/users', 'User', 1, 1, 1),
(22, 20, '角色管理', '/system/roles', 'UserFilled', 2, 1, 1),
(23, 20, '部门管理', '/system/depts', 'OfficeBuilding', 3, 1, 1),
(24, 20, '菜单管理', '/system/menus', 'Menu', 4, 1, 1),
(25, 20, '权限管理', '/system/permissions', 'Lock', 5, 1, 1),
(26, 20, '系统配置', '/system/config', 'Tools', 6, 1, 1),
(27, 20, '监控中心', '/system/monitor', 'Monitor', 7, 1, 1),
(28, 20, '审计日志', '/system/audit', 'DocumentChecked', 8, 1, 1),
(29, 20, '租户管理', '/system/tenants', 'OfficeBuilding', 9, 1, 1),
(30, 0, '个人中心', '/profile', 'User', 6, 1, 1),
(31, 30, '个人信息', '/profile/info', 'User', 1, 1, 1),
(32, 30, '安全设置', '/profile/security', 'Lock', 2, 1, 1),
(33, 30, '我的收藏', '/profile/favorites', 'Star', 3, 1, 1);

-- 部门树
DELETE FROM sys_dept;
INSERT IGNORE INTO sys_dept (id, tenant_id, parent_id, name, code, sort, leader, phone, status) VALUES 
(1, 1, 0, '腾讯科技', 'TENCENT', 0, '马化腾', '0755-86013388', 1),
(2, 1, 1, '技术工程事业群', 'TEG', 1, '张峰', '0755-86013301', 1),
(3, 1, 2, '基础架构部', 'TEG-INFRA', 1, '李明', '0755-86013302', 1),
(4, 1, 2, '数据中心', 'TEG-DC', 2, '王刚', '0755-86013303', 1),
(5, 1, 2, '安全部', 'TEG-SEC', 3, '赵强', '0755-86013304', 1),
(6, 1, 1, '微信事业群', 'WXG', 2, '张小龙', '0755-86013305', 1),
(7, 1, 6, '微信开发部', 'WXG-DEV', 1, '陈华', '0755-86013306', 1),
(8, 1, 6, '微信产品部', 'WXG-PROD', 2, '刘芳', '0755-86013307', 1),
(9, 1, 1, '云与智慧产业事业群', 'CSIG', 3, '汤道生', '0755-86013308', 1),
(10, 1, 9, '腾讯云', 'CSIG-CLOUD', 1, '邱跃鹏', '0755-86013309', 1),
(11, 1, 9, '智慧产业', 'CSIG-SI', 2, '万超', '0755-86013310', 1),
(12, 1, 1, '平台与内容事业群', 'PCG', 4, '任宇昕', '0755-86013311', 1),
(13, 1, 12, '腾讯视频', 'PCG-VIDEO', 1, '孙忠怀', '0755-86013312', 1),
(14, 1, 12, '腾讯新闻', 'PCG-NEWS', 2, '陈菊红', '0755-86013313', 1),
(15, 1, 1, '企业发展事业群', 'CDG', 5, '刘胜义', '0755-86013314', 1),
(16, 1, 15, '战略发展部', 'CDG-STRATEGY', 1, '林璟骅', '0755-86013315', 1),
(17, 1, 15, '人力资源部', 'CDG-HR', 2, '奚丹', '0755-86013316', 1),
(18, 1, 15, '财务部', 'CDG-FINANCE', 3, '罗硕瀚', '0755-86013317', 1),
(19, 1, 1, '互动娱乐事业群', 'IEG', 6, '马晓轶', '0755-86013318', 1),
(20, 1, 19, '游戏开发部', 'IEG-GAME', 1, '倪曙光', '0755-86013319', 1);

-- ==================== kba_knowledge ====================

USE kba_knowledge;

-- 创建知识空间表 (如果不存在)
CREATE TABLE IF NOT EXISTS kb_knowledge_space (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '知识空间ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    name VARCHAR(100) NOT NULL COMMENT '空间名称',
    description VARCHAR(500) COMMENT '空间描述',
    icon VARCHAR(50) DEFAULT 'folder' COMMENT '图标',
    document_count INT DEFAULT 0 COMMENT '文档数量',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_by BIGINT COMMENT '创建人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识空间表';

-- 创建知识文档表
CREATE TABLE IF NOT EXISTS kb_document (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '文档ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    knowledge_space_id BIGINT NOT NULL COMMENT '知识空间ID',
    name VARCHAR(500) NOT NULL COMMENT '文档名称',
    type VARCHAR(50) COMMENT '文档类型',
    size BIGINT COMMENT '文件大小',
    file_path VARCHAR(500) COMMENT '文件路径',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/processing/completed/failed',
    chunk_count INT DEFAULT 0 COMMENT '分片数量',
    metadata JSON COMMENT '元数据',
    created_by BIGINT COMMENT '创建人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_knowledge_space_id (knowledge_space_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识文档表';

-- 创建数据源类型表
CREATE TABLE IF NOT EXISTS kb_data_source_type (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '类型ID',
    name VARCHAR(50) NOT NULL COMMENT '类型名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '类型编码',
    icon VARCHAR(100) COMMENT '图标',
    description VARCHAR(255) COMMENT '描述',
    config_schema JSON COMMENT '配置Schema',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据源类型表';

-- 创建同步任务记录表
CREATE TABLE IF NOT EXISTS kb_sync_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    data_source_id BIGINT COMMENT '数据源ID',
    sync_type VARCHAR(20) COMMENT '同步类型: FULL/INCREMENTAL',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='同步任务记录表';

-- 创建分段策略表
CREATE TABLE IF NOT EXISTS kb_chunk_strategy (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '策略ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    name VARCHAR(100) NOT NULL COMMENT '策略名称',
    code VARCHAR(50) NOT NULL COMMENT '策略编码',
    type VARCHAR(50) NOT NULL COMMENT '策略类型: AUTO/SEMANTIC/CUSTOM',
    config JSON COMMENT '策略配置',
    description VARCHAR(500) COMMENT '描述',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分段策略表';

-- 创建元数据规则表
CREATE TABLE IF NOT EXISTS kb_metadata_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '规则ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    knowledge_space_id BIGINT COMMENT '知识空间ID',
    name VARCHAR(100) NOT NULL COMMENT '规则名称',
    field_name VARCHAR(100) NOT NULL COMMENT '字段名',
    field_type VARCHAR(50) NOT NULL COMMENT '字段类型: STRING/NUMBER/DATE/JSON',
    extraction_rule JSON COMMENT '提取规则',
    is_required TINYINT DEFAULT 0 COMMENT '是否必填',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_knowledge_space_id (knowledge_space_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='元数据规则表';

-- 创建知识标签表
CREATE TABLE IF NOT EXISTS kb_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '标签ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    name VARCHAR(50) NOT NULL COMMENT '标签名称',
    color VARCHAR(20) COMMENT '标签颜色',
    description VARCHAR(255) COMMENT '描述',
    use_count INT DEFAULT 0 COMMENT '使用次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_tenant_name (tenant_id, name),
    INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识标签表';

-- 创建知识标签关联表
CREATE TABLE IF NOT EXISTS kb_knowledge_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    knowledge_id BIGINT NOT NULL COMMENT '知识ID',
    tag_id BIGINT NOT NULL COMMENT '标签ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_knowledge_tag (knowledge_id, tag_id),
    INDEX idx_knowledge_id (knowledge_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识标签关联表';

-- 知识空间
INSERT IGNORE INTO kb_knowledge_space (id, tenant_id, name, description, icon, document_count, status, created_by) VALUES 
(1, 1, '产品文档知识库', '公司所有产品相关文档，包括产品说明书、用户手册、功能介绍等', 'folder', 156, 1, 1),
(2, 1, 'FAQ库', '常见问题解答、客户支持知识库', 'question', 89, 1, 1),
(3, 1, '结构化数据知识库', '数据库、Excel等结构化数据知识', 'database', 45, 1, 1),
(4, 1, '内部培训资料', '员工培训课程、入职指南、技能提升材料等', 'education', 234, 1, 1),
(5, 1, '客服知识库', '客服人员使用的问题解答和处理流程', 'headset', 167, 1, 1);

-- 知识文档
INSERT IGNORE INTO kb_document (id, tenant_id, knowledge_space_id, name, type, size, status, chunk_count, created_by) VALUES 
(1, 1, 1, '智能客服系统产品说明书.pdf', 'pdf', 2456789, 'completed', 128, 1),
(2, 1, 1, '数据分析平台用户手册.docx', 'docx', 1567890, 'completed', 86, 1),
(3, 1, 1, '企业知识管理系统介绍.pptx', 'pptx', 3456789, 'completed', 45, 1),
(4, 1, 2, '常见问题FAQ汇总.xlsx', 'xlsx', 567890, 'completed', 34, 1),
(5, 1, 2, '客户投诉处理流程.md', 'md', 123456, 'completed', 12, 1),
(6, 1, 3, '产品数据字典.xlsx', 'xlsx', 890123, 'completed', 56, 1),
(7, 1, 3, '业务数据库表结构文档.sql', 'sql', 234567, 'completed', 78, 1),
(8, 1, 4, '新员工入职培训手册.pdf', 'pdf', 2345678, 'completed', 98, 1),
(9, 1, 4, '销售技能培训材料.pptx', 'pptx', 5678901, 'processing', 0, 1),
(10, 1, 5, '客服标准话术库.docx', 'docx', 1234567, 'completed', 67, 1);

-- 数据源类型
INSERT IGNORE INTO kb_data_source_type (id, name, code, icon, description, status) VALUES 
(1, '文件上传', 'UPLOAD', 'Upload', '支持本地文件上传，支持PDF、Word、Excel等格式', 1),
(2, '数据库', 'DATABASE', 'Coin', '连接MySQL、PostgreSQL、Oracle等数据库', 1),
(3, '网页爬虫', 'WEB', 'Link', '自动抓取指定网页内容', 1),
(4, 'API接口', 'API', 'Connection', '通过API接口获取数据', 1),
(5, '飞书文档', 'FEISHU', 'ChatDotRound', '同步飞书云文档内容', 1),
(6, '钉钉文档', 'DINGTALK', 'ChatLineRound', '同步钉钉文档内容', 1),
(7, '企业微信', 'WECOM', 'ChatRound', '同步企业微信文档', 1),
(8, 'Confluence', 'CONFLUENCE', 'Document', '同步Confluence知识库', 1);

-- 数据源
INSERT IGNORE INTO kb_data_source (id, tenant_id, name, type, config, status, created_by) VALUES 
(1, 1, '产品文档上传', 'UPLOAD', '{"storageType": "local", "allowedTypes": ["pdf", "docx", "xlsx", "pptx", "md"]}', 1, 1),
(2, 1, '业务数据库', 'DATABASE', '{"host": "mysql.internal.tencent.com", "port": 3306, "database": "business_db", "syncInterval": 3600}', 1, 2),
(3, 1, '官网内容爬虫', 'WEB', '{"url": "https://cloud.tencent.com", "depth": 2, "schedule": "0 0 2 * * ?"}', 1, 3),
(4, 1, '开放API数据', 'API', '{"endpoint": "https://api.internal.tencent.com/knowledge", "method": "GET", "authType": "bearer"}', 1, 1),
(5, 1, '飞书知识库同步', 'FEISHU', '{"spaceId": "space_001", "syncMode": "incremental"}', 1, 2);

-- 同步任务记录
INSERT IGNORE INTO kb_sync_task (id, tenant_id, data_source_id, status, progress, total_count, success_count, failed_count, started_at, finished_at) VALUES 
(1, 1, 1, 'SUCCESS', 100, 156, 156, 0, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 1, 2, 'SUCCESS', 100, 45, 45, 0, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 30 MINUTE),
(3, 1, 3, 'RUNNING', 65, 200, 130, 5, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL),
(4, 1, 4, 'PENDING', 0, 0, 0, 0, NULL, NULL),
(5, 1, 5, 'SUCCESS', 100, 89, 89, 0, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 45 MINUTE);

-- 同步日志
INSERT IGNORE INTO kb_sync_log (id, tenant_id, data_source_id, sync_type, status, total_count, success_count, failed_count, started_at, finished_at) VALUES 
(1, 1, 1, 'FULL', 'SUCCESS', 156, 156, 0, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 1, 2, 'INCREMENTAL', 'SUCCESS', 45, 45, 0, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 30 MINUTE),
(3, 1, 3, 'FULL', 'RUNNING', 200, 130, 5, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL),
(4, 1, 5, 'INCREMENTAL', 'SUCCESS', 89, 89, 0, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 45 MINUTE);

-- 分段策略
INSERT IGNORE INTO kb_chunk_strategy (id, tenant_id, name, code, type, config, description, is_default, status) VALUES 
(1, 1, '默认分段策略', 'DEFAULT', 'AUTO', '{"maxTokens": 500, "overlap": 50, "separator": "\\n\\n"}', '自动分段，适用于大多数文档', 1, 1),
(2, 1, '语义分段策略', 'SEMANTIC', 'SEMANTIC', '{"similarityThreshold": 0.7, "minChunkSize": 100, "maxChunkSize": 1000}', '基于语义相似度的智能分段', 0, 1),
(3, 1, '代码分段策略', 'CODE', 'CUSTOM', '{"language": "auto", "chunkByFunction": true, "includeComments": true}', '适用于代码文件的分段策略', 0, 1),
(4, 1, '表格分段策略', 'TABLE', 'CUSTOM', '{"preserveStructure": true, "maxRows": 100}', '适用于表格类文档的分段', 0, 1),
(5, 1, 'Q&A分段策略', 'QA', 'CUSTOM', '{"qaPattern": "Q:|A:", "includeContext": true}', '适用于问答对格式的分段', 0, 1);

-- 元数据规则
INSERT IGNORE INTO kb_metadata_rule (id, tenant_id, knowledge_space_id, name, field_name, field_type, extraction_rule, is_required, status) VALUES 
(1, 1, 1, '文档版本', 'doc_version', 'STRING', '{"pattern": "v\\\\d+\\\\.\\\\d+", "source": "filename"}', 1, 1),
(2, 1, 1, '创建日期', 'create_date', 'DATE', '{"format": "yyyy-MM-dd", "source": "metadata"}', 1, 1),
(3, 1, 1, '作者', 'author', 'STRING', '{"source": "metadata", "fallback": "unknown"}', 0, 1),
(4, 1, 2, '问题分类', 'question_category', 'STRING', '{"values": ["产品", "技术", "服务", "其他"], "source": "content"}', 1, 1),
(5, 1, 3, '数据来源', 'data_source', 'STRING', '{"values": ["internal", "external"], "source": "config"}', 1, 1);

-- 知识标签
INSERT IGNORE INTO kb_tag (id, tenant_id, name, color, description, use_count) VALUES 
(1, 1, '产品文档', '#409EFF', '产品相关文档标签', 156),
(2, 1, '技术文档', '#67C23A', '技术类文档标签', 243),
(3, 1, 'FAQ', '#E6A23C', '常见问题标签', 89),
(4, 1, '培训材料', '#F56C6C', '培训相关文档标签', 234),
(5, 1, '客服知识', '#909399', '客服相关标签', 167),
(6, 1, '重要', '#F56C6C', '重要文档标记', 45),
(7, 1, '已审核', '#67C23A', '已审核通过的文档', 320),
(8, 1, '待更新', '#E6A23C', '需要更新的文档', 23),
(9, 1, '内部', '#909399', '内部文档', 450),
(10, 1, '公开', '#409EFF', '可公开文档', 120);

-- ==================== kba_ai ====================

USE kba_ai;

-- 创建模型供应商表
CREATE TABLE IF NOT EXISTS ai_model_provider (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '供应商ID',
    name VARCHAR(100) NOT NULL COMMENT '供应商名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '供应商编码',
    icon VARCHAR(500) COMMENT '图标URL',
    description VARCHAR(500) COMMENT '描述',
    config_schema JSON COMMENT '配置Schema',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模型供应商表';

-- 创建模型路由配置表
CREATE TABLE IF NOT EXISTS ai_model_route (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '路由ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    name VARCHAR(100) NOT NULL COMMENT '路由名称',
    route_type VARCHAR(50) NOT NULL COMMENT '路由类型: CHAT/EMBEDDING/RERANK',
    model_id BIGINT COMMENT '主模型ID',
    fallback_model_id BIGINT COMMENT '备用模型ID',
    config JSON COMMENT '路由配置',
    priority INT DEFAULT 0 COMMENT '优先级',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_route_type (route_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模型路由配置表';

-- 创建智能助手表
CREATE TABLE IF NOT EXISTS ai_assistant (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '助手ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    name VARCHAR(100) NOT NULL COMMENT '助手名称',
    description VARCHAR(500) COMMENT '助手描述',
    avatar VARCHAR(500) COMMENT '头像URL',
    category VARCHAR(50) COMMENT '分类',
    capabilities JSON COMMENT '能力列表',
    system_prompt TEXT COMMENT '系统提示词',
    knowledge_space_ids JSON COMMENT '关联知识空间',
    model_id BIGINT COMMENT '关联模型ID',
    config JSON COMMENT '配置',
    is_popular TINYINT DEFAULT 0 COMMENT '是否热门',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_by BIGINT COMMENT '创建人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='智能助手表';

-- 创建助手会话表
CREATE TABLE IF NOT EXISTS ai_assistant_session (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
    tenant_id BIGINT NOT NULL COMMENT '租户ID',
    assistant_id BIGINT NOT NULL COMMENT '助手ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    title VARCHAR(200) COMMENT '会话标题',
    context JSON COMMENT '会话上下文',
    status TINYINT DEFAULT 1 COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_assistant_id (assistant_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='助手会话表';

-- 创建助手消息表
CREATE TABLE IF NOT EXISTS ai_assistant_message (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='助手消息表';

-- 模型供应商
INSERT IGNORE INTO ai_model_provider (id, name, code, icon, description, status) VALUES 
(1, 'OpenAI', 'OPENAI', '/icons/openai.svg', 'OpenAI官方API，支持GPT-4、GPT-3.5等模型', 1),
(2, 'Azure OpenAI', 'AZURE_OPENAI', '/icons/azure.svg', '微软Azure托管的OpenAI服务', 1),
(3, '本地模型', 'LOCAL', '/icons/server.svg', '本地部署的开源模型，如Llama、Qwen等', 1),
(4, '字节豆包', 'DOUBAO', '/icons/doubao.svg', '字节跳动豆包大模型', 1),
(5, '阿里通义', 'QWEN', '/icons/qwen.svg', '阿里云通义千问大模型', 1),
(6, '百度文心', 'ERNIE', '/icons/ernie.svg', '百度文心一言大模型', 1),
(7, '智谱AI', 'ZHIPU', '/icons/zhipu.svg', '智谱AI GLM系列模型', 1),
(8, 'Anthropic', 'ANTHROPIC', '/icons/anthropic.svg', 'Claude系列模型', 1);

-- 模型信息
INSERT IGNORE INTO ai_llm_model (id, tenant_id, name, provider, model_type, config, quota_limit, quota_used, status) VALUES 
(1, 1, 'GPT-4o', 'OPENAI', 'gpt-4o', '{"contextWindow": 128000, "maxOutput": 4096, "temperature": 0.7}', 1000000, 125000, 1),
(2, 1, 'GPT-4o-mini', 'OPENAI', 'gpt-4o-mini', '{"contextWindow": 128000, "maxOutput": 16384, "temperature": 0.7}', 5000000, 890000, 1),
(3, 1, 'GPT-4-Turbo', 'OPENAI', 'gpt-4-turbo', '{"contextWindow": 128000, "maxOutput": 4096}', 500000, 45000, 1),
(4, 1, 'GPT-3.5-Turbo', 'OPENAI', 'gpt-3.5-turbo', '{"contextWindow": 16384, "maxOutput": 4096}', 10000000, 2340000, 1),
(5, 1, 'Claude-3-Opus', 'ANTHROPIC', 'claude-3-opus', '{"contextWindow": 200000, "maxOutput": 4096}', 500000, 78000, 1),
(6, 1, 'Claude-3-Sonnet', 'ANTHROPIC', 'claude-3-sonnet', '{"contextWindow": 200000, "maxOutput": 4096}', 1000000, 234000, 1),
(7, 1, 'Qwen2.5-72B', 'QWEN', 'qwen2.5-72b-instruct', '{"contextWindow": 131072, "maxOutput": 8192}', 2000000, 456000, 1),
(8, 1, 'Qwen2.5-32B', 'QWEN', 'qwen2.5-32b-instruct', '{"contextWindow": 131072, "maxOutput": 8192}', 3000000, 567000, 1),
(9, 1, 'Llama3.1-70B', 'LOCAL', 'llama3.1-70b', '{"contextWindow": 131072, "maxOutput": 4096, "endpoint": "http://llm-server:8000"}', 999999999, 123000, 1),
(10, 1, 'Doubao-Pro-32K', 'DOUBAO', 'doubao-pro-32k', '{"contextWindow": 32768, "maxOutput": 4096}', 2000000, 345000, 1),
(11, 1, 'GLM-4', 'ZHIPU', 'glm-4', '{"contextWindow": 128000, "maxOutput": 4096}', 1500000, 234000, 1),
(12, 1, 'text-embedding-3-large', 'OPENAI', 'text-embedding-3-large', '{"dimensions": 3072}', 10000000, 1230000, 1),
(13, 1, 'text-embedding-3-small', 'OPENAI', 'text-embedding-3-small', '{"dimensions": 1536}', 20000000, 4560000, 1),
(14, 1, 'BGE-large-zh', 'LOCAL', 'bge-large-zh', '{"dimensions": 1024, "endpoint": "http://embedding-server:8001"}', 999999999, 567000, 1),
(15, 1, 'BGE-m3', 'LOCAL', 'bge-m3', '{"dimensions": 1024, "endpoint": "http://embedding-server:8001"}', 999999999, 234000, 1);

-- Dify应用
INSERT IGNORE INTO ai_app (id, tenant_id, name, description, type, dify_app_id, model_id, config, status, created_by) VALUES 
(1, 1, '智能客服助手', '专业的客服助手，可以帮助解答客户问题、处理投诉、提供服务指引', 'CHATBOT', 'dify-cs-001', 1, '{"temperature": 0.7, "topP": 0.9, "maxTokens": 2048}', 1, 1),
(2, 1, '文档摘要生成', '自动提取文档关键信息，生成结构化摘要', 'WORKFLOW', 'dify-summary-001', 2, '{"summaryLength": 500, "language": "zh"}', 1, 2),
(3, 1, '实时问答系统', '基于知识库的实时问答，支持多轮对话', 'CHATBOT', 'dify-qa-001', 7, '{"enableReference": true, "knowledgeSpaceIds": [1, 2, 5]}', 1, 1),
(4, 1, '技术文档检索', '技术文档智能检索和代码示例推荐', 'AGENT', 'dify-tech-001', 3, '{"searchDepth": 3, "includeCodeExamples": true}', 1, 3);

-- 智能助手
INSERT IGNORE INTO ai_assistant (id, tenant_id, name, description, avatar, category, capabilities, system_prompt, knowledge_space_ids, model_id, is_popular, status, created_by) VALUES 
(1, 1, '智能客服助手', '专业的客服助手，可以帮助解答客户问题、处理投诉、提供服务指引', 'https://api.dicebear.com/7.x/bottts/svg?seed=customer-service', '客服', '["问题解答", "投诉处理", "服务指引", "常见问题查询"]', '你是一个专业的客服助手，请用友好、专业的态度回答用户问题。', '[1, 2, 5]', 1, 1, 1, 1),
(2, 1, '销售助手', '销售业务助手，提供产品介绍、报价查询、客户跟进建议等支持', 'https://api.dicebear.com/7.x/bottts/svg?seed=sales', '销售', '["产品介绍", "报价查询", "客户跟进", "销售话术"]', '你是一个专业的销售助手，请帮助销售人员进行客户沟通和产品推广。', '[1]', 2, 1, 1, 2),
(3, 1, '研发助手', '技术支持助手，协助开发人员查询技术文档、代码示例、最佳实践', 'https://api.dicebear.com/7.x/bottts/svg?seed=developer', '研发', '["技术文档查询", "代码示例", "API说明", "问题排查"]', '你是一个专业的研发助手，请帮助开发人员解决技术问题。', '[2]', 3, 1, 1, 3),
(4, 1, '运营助手', '运营业务助手，协助处理日常运营事务、数据分析、活动策划', 'https://api.dicebear.com/7.x/bottts/svg?seed=operations', '运营', '["数据分析", "活动策划", "用户运营", "内容管理"]', '你是一个专业的运营助手，请帮助运营人员处理日常业务。', '[]', 4, 0, 1, 4);

-- 模型路由配置
INSERT IGNORE INTO ai_model_route (id, tenant_id, name, route_type, model_id, fallback_model_id, config, priority, status) VALUES 
(1, 1, '默认对话路由', 'CHAT', 1, 2, '{"retryCount": 3, "timeout": 30000}', 100, 1),
(2, 1, '高并发对话路由', 'CHAT', 2, 4, '{"retryCount": 2, "timeout": 20000}', 90, 1),
(3, 1, '中文对话路由', 'CHAT', 7, 8, '{"retryCount": 3, "timeout": 30000}', 95, 1),
(4, 1, '默认嵌入路由', 'EMBEDDING', 12, 13, '{"batchSize": 100}', 100, 1),
(5, 1, '中文嵌入路由', 'EMBEDDING', 14, 15, '{"batchSize": 100}', 95, 1);

-- 助手会话
INSERT IGNORE INTO ai_assistant_session (id, tenant_id, assistant_id, user_id, title, status) VALUES 
(1, 1, 1, 2, '客户投诉处理咨询', 1),
(2, 1, 2, 3, '产品报价方案讨论', 1),
(3, 1, 3, 2, '代码调试问题排查', 1),
(4, 1, 4, 4, '活动策划方案讨论', 1),
(5, 1, 1, 3, '服务流程咨询', 1);

-- ==================== kba_ops ====================

USE kba_ops;

-- 更多系统配置
INSERT IGNORE INTO ops_system_config (tenant_id, config_key, config_value, config_type, description) VALUES 
(0, 'system.version', '1.0.0', 'STRING', '系统版本'),
(0, 'system.copyright', 'Copyright 2024 Tencent. All Rights Reserved.', 'STRING', '版权信息'),
(0, 'security.login.maxAttempts', '5', 'NUMBER', '登录最大尝试次数'),
(0, 'security.login.lockDuration', '1800', 'NUMBER', '账户锁定时长(秒)'),
(0, 'security.password.minLength', '8', 'NUMBER', '密码最小长度'),
(0, 'security.password.requireUppercase', 'true', 'BOOLEAN', '密码是否需要大写字母'),
(0, 'security.password.requireLowercase', 'true', 'BOOLEAN', '密码是否需要小写字母'),
(0, 'security.password.requireNumber', 'true', 'BOOLEAN', '密码是否需要数字'),
(0, 'security.password.requireSpecialChar', 'true', 'BOOLEAN', '密码是否需要特殊字符'),
(0, 'security.session.timeout', '7200', 'NUMBER', '会话超时时间(秒)'),
(0, 'ai.embedding.defaultModel', 'text-embedding-3-small', 'STRING', '默认嵌入模型'),
(0, 'ai.chat.defaultModel', 'gpt-4o-mini', 'STRING', '默认对话模型'),
(0, 'ai.rerank.enabled', 'true', 'BOOLEAN', '是否启用重排序'),
(0, 'knowledge.chunk.defaultSize', '500', 'NUMBER', '默认分片大小'),
(0, 'knowledge.chunk.overlap', '50', 'NUMBER', '分片重叠大小'),
(0, 'knowledge.vector.dimensions', '1536', 'NUMBER', '向量维度'),
(0, 'storage.type', 'minio', 'STRING', '存储类型'),
(0, 'storage.maxFileSize', '104857600', 'NUMBER', '最大文件大小(字节)'),
(1, 'tenant.name', '默认租户', 'STRING', '租户名称'),
(1, 'tenant.logo', '/assets/tenant/default/logo.png', 'STRING', '租户Logo'),
(1, 'tenant.theme', 'default', 'STRING', '租户主题');

-- 审计日志示例
INSERT IGNORE INTO ops_audit_log (id, tenant_id, user_id, username, action, resource, method, url, ip, user_agent, response_code, duration, status, error_message) VALUES 
(1, 1, 1, 'admin', 'LOGIN', '/api/v1/auth/login', 'POST', '/api/v1/auth/login', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 200, 156, 1, NULL),
(2, 1, 1, 'admin', 'VIEW', '/api/v1/users', 'GET', '/api/v1/users?page=1&size=10', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 200, 23, 1, NULL),
(3, 1, 1, 'admin', 'CREATE', '/api/v1/users', 'POST', '/api/v1/users', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 201, 89, 1, NULL),
(4, 1, 2, 'zhangsan', 'LOGIN', '/api/v1/auth/login', 'POST', '/api/v1/auth/login', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 200, 145, 1, NULL),
(5, 1, 2, 'zhangsan', 'VIEW', '/api/v1/knowledge/spaces', 'GET', '/api/v1/knowledge/spaces', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 200, 34, 1, NULL),
(6, 1, 2, 'zhangsan', 'UPLOAD', '/api/v1/knowledge/documents/upload', 'POST', '/api/v1/knowledge/documents/upload', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 201, 2345, 1, NULL),
(7, 1, 3, 'lisi', 'LOGIN', '/api/v1/auth/login', 'POST', '/api/v1/auth/login', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 200, 167, 1, NULL),
(8, 1, 3, 'lisi', 'CHAT', '/api/v1/ai/chat', 'POST', '/api/v1/ai/chat', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 200, 3456, 1, NULL),
(9, 1, 4, 'wangwu', 'LOGIN', '/api/v1/auth/login', 'POST', '/api/v1/auth/login', '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15', 200, 234, 1, NULL),
(10, 1, 4, 'wangwu', 'SEARCH', '/api/v1/search', 'POST', '/api/v1/search', '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15', 200, 567, 1, NULL),
(11, 1, 1, 'admin', 'DELETE', '/api/v1/knowledge/documents/999', 'DELETE', '/api/v1/knowledge/documents/999', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 404, 12, 0, 'Document not found'),
(12, 1, 5, 'unknown', 'LOGIN', '/api/v1/auth/login', 'POST', '/api/v1/auth/login', '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 401, 78, 0, 'Invalid credentials'),
(13, 1, 1, 'admin', 'UPDATE', '/api/v1/system/config', 'PUT', '/api/v1/system/config', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 200, 45, 1, NULL),
(14, 1, 2, 'zhangsan', 'EXPORT', '/api/v1/export/documents', 'GET', '/api/v1/export/documents?format=xlsx', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 200, 5678, 1, NULL),
(15, 1, 1, 'admin', 'VIEW', '/api/v1/system/audit-logs', 'GET', '/api/v1/system/audit-logs?page=1&size=20', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 200, 123, 1, NULL);

-- ==================== 完成 ====================

SELECT 'Mock data initialization completed!' AS message;