-- ====================================
-- KBA User Data Initialization Script
-- 用户相关数据表: 收藏、待办、用户档案
-- ====================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ==================== kba_identity ====================

USE kba_identity;

-- 用户待办表
CREATE TABLE IF NOT EXISTS sys_user_todo (
    id BIGINT PRIMARY KEY COMMENT '待办ID (雪花ID)',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    content VARCHAR(500) NOT NULL COMMENT '待办内容',
    completed TINYINT DEFAULT 0 COMMENT '完成状态: 0-未完成, 1-已完成',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_tenant_user (tenant_id, user_id),
    INDEX idx_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户待办表';

-- 用户档案扩展表
CREATE TABLE IF NOT EXISTS sys_user_profile (
    id BIGINT PRIMARY KEY COMMENT '档案ID (雪花ID)',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(500) COMMENT '头像URL',
    bio VARCHAR(500) COMMENT '个人简介',
    company VARCHAR(100) COMMENT '公司',
    position VARCHAR(100) COMMENT '职位',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_tenant_user (tenant_id, user_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户档案扩展表';

-- 用户待办数据
INSERT IGNORE INTO sys_user_todo (id, tenant_id, user_id, content, completed, created_at) VALUES 
(1876543210000001, 1, 1, '完成项目文档编写', 0, '2024-03-10 08:00:00'),
(1876543210000002, 1, 1, '参加团队周会', 0, '2024-03-10 09:00:00'),
(1876543210000003, 1, 1, '提交周报', 1, '2024-03-09 14:00:00'),
(1876543210000004, 1, 1, '审核PRD文档', 0, '2024-03-10 10:00:00');

-- 用户档案数据
INSERT IGNORE INTO sys_user_profile (id, tenant_id, user_id, nickname, avatar, bio, company, position, created_at, updated_at) VALUES 
(1876543220000001, 1, 1, 'Demo User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', NULL, '腾讯科技', '高级工程师', '2024-01-01 00:00:00', '2024-03-10 10:00:00');

-- ==================== kba_knowledge ====================

USE kba_knowledge;

-- 收藏表
CREATE TABLE IF NOT EXISTS kb_favorite (
    id BIGINT PRIMARY KEY COMMENT '收藏ID (雪花ID)',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    document_id BIGINT COMMENT '文档ID',
    document_name VARCHAR(500) COMMENT '文档名称',
    knowledge_id BIGINT COMMENT '知识ID',
    knowledge_name VARCHAR(200) COMMENT '知识库名称',
    content TEXT COMMENT '收藏内容片段',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_tenant_user_doc (tenant_id, user_id, document_id),
    INDEX idx_tenant_user (tenant_id, user_id),
    INDEX idx_document_id (document_id),
    INDEX idx_knowledge_id (knowledge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- 收藏数据
INSERT IGNORE INTO kb_favorite (id, tenant_id, user_id, document_id, document_name, knowledge_id, knowledge_name, created_at) VALUES 
(1876543230000001, 1, 1, 1, '智能客服系统产品说明书.pdf', 1, '产品文档知识库', '2024-03-08 10:00:00'),
(1876543230000002, 1, 1, 3, '企业知识管理系统介绍.pptx', 2, 'FAQ库', '2024-03-07 14:30:00'),
(1876543230000003, 1, 1, 8, '新员工入职培训手册.pdf', 4, '内部培训资料', '2024-03-05 09:15:00');

-- 标签数据 (kb_tag表已在03-mock-data.sql中创建)
INSERT IGNORE INTO kb_tag (id, tenant_id, name, color, description, use_count) VALUES 
(100, 1, '产品', '#409EFF', '产品相关标签', 156),
(101, 1, '技术', '#67C23A', '技术相关标签', 243),
(102, 1, '培训', '#E6A23C', '培训相关标签', 89),
(103, 1, '政策', '#F56C6C', '政策相关标签', 67),
(104, 1, '销售', '#909399', '销售相关标签', 134),
(105, 1, '运营', '#00BFFF', '运营相关标签', 78),
(106, 1, '客服', '#FF69B4', '客服相关标签', 45),
(107, 1, '人力资源', '#9370DB', '人力资源标签', 32);

-- ==================== 完成 ====================

SELECT 'User data initialization completed!' AS message;