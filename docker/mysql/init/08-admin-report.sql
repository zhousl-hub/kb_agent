-- ====================================
-- 报告中心表（report）
-- 已从旧 admin 单体迁移到知识服务库 kba_knowledge
-- ====================================
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE kba_knowledge;

CREATE TABLE IF NOT EXISTS report (
    id BIGINT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT,
    status VARCHAR(20) DEFAULT 'draft',
    version INT DEFAULT 1,
    author_id BIGINT,
    author_name VARCHAR(100),
    department_id BIGINT,
    department_name VARCHAR(100),
    tags VARCHAR(500),
    published_at TIMESTAMP NULL,
    tenant_id BIGINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    INDEX idx_status (status),
    INDEX idx_author_id (author_id),
    INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO report (id, title, content, status, version, author_id, author_name, department_id, department_name, tenant_id, created_at, updated_at) VALUES
(1001, 'Q4 Sales Report', 'Q4 sales grew 15% year over year.', 'published', 2, 1, 'admin', 1, 'Sales', 1, '2024-03-01 10:00:00', '2024-03-08 14:30:00'),
(1002, 'Product Requirements v2.0', 'Phase 2 feature requirements for the knowledge platform.', 'draft', 1, 1, 'admin', 2, 'Product', 1, '2024-03-05 09:00:00', '2024-03-10 11:00:00'),
(1003, 'Architecture Review', 'Microservice architecture review and optimization suggestions.', 'published', 1, 1, 'admin', 3, 'Engineering', 1, '2024-03-07 15:00:00', '2024-03-09 16:00:00'),
(1004, 'Customer Satisfaction Survey', 'Q1 2024 customer satisfaction survey analysis.', 'draft', 1, 1, 'admin', 1, 'Support', 1, '2024-03-08 08:30:00', '2024-03-10 09:00:00');
