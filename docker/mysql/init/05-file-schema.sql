-- =====================================================
-- 文件服务数据库初始化脚本
-- 数据库: kba_file
-- 创建时间: 2026-03-11
-- =====================================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS kba_file DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE kba_file;

-- =====================================================
-- 文件信息表
-- =====================================================
CREATE TABLE IF NOT EXISTS file_info (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    original_name VARCHAR(255) COMMENT '原始文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    bucket VARCHAR(100) COMMENT '存储桶',
    content_type VARCHAR(100) COMMENT '内容类型',
    file_size BIGINT COMMENT '文件大小(字节)',
    md5 VARCHAR(64) COMMENT '文件MD5',
    storage_type VARCHAR(50) DEFAULT 'minio' COMMENT '存储类型',
    tenant_id BIGINT COMMENT '租户ID',
    user_id BIGINT COMMENT '用户ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_md5 (md5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件信息表';

-- =====================================================
-- 插入测试数据 - 知识库文档文件
-- =====================================================

INSERT INTO file_info (id, file_name, original_name, file_path, bucket, content_type, file_size, md5, storage_type, tenant_id, user_id, created_at, updated_at, deleted) VALUES
(1001, 'doc_20260301_tech_arch.pdf', '技术架构设计文档.pdf', '/knowledge/docs/2026/03/tech_arch.pdf', 'kba-knowledge', 'application/pdf', 2048576, 'a1b2c3d4e5f6789012345678901234ab', 'minio', 1, 1001, '2026-03-01 09:30:00', '2026-03-01 09:30:00', 0),

(1002, 'doc_20260302_api_guide.md', 'API接口指南.md', '/knowledge/docs/2026/03/api_guide.md', 'kba-knowledge', 'text/markdown', 51200, 'b2c3d4e5f678901234567890123456cd', 'minio', 1, 1001, '2026-03-02 10:15:00', '2026-03-02 10:15:00', 0),

(1003, 'doc_20260303_user_manual.docx', '用户操作手册.docx', '/knowledge/docs/2026/03/user_manual.docx', 'kba-knowledge', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 3145728, 'c3d4e5f67890123456789012345678de', 'minio', 1, 1002, '2026-03-03 14:20:00', '2026-03-03 14:20:00', 0),

(1004, 'doc_20260304_deployment.xlsx', '部署配置清单.xlsx', '/knowledge/docs/2026/03/deployment.xlsx', 'kba-knowledge', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 102400, 'd4e5f678901234567890123456789ef', 'minio', 2, 1001, '2026-03-04 11:00:00', '2026-03-04 11:00:00', 0),

(1005, 'doc_20260305_rag_design.pdf', 'RAG系统设计文档.pdf', '/knowledge/docs/2026/03/rag_design.pdf', 'kba-knowledge', 'application/pdf', 1572864, 'e5f678901234567890123456789012fa', 'minio', 1, 1003, '2026-03-05 16:45:00', '2026-03-05 16:45:00', 0),

(1006, 'doc_20260306_data_model.png', '数据模型架构图.png', '/knowledge/images/2026/03/data_model.png', 'kba-knowledge', 'image/png', 524288, 'f6789012345678901234567890123ab', 'minio', 1, 1001, '2026-03-06 09:00:00', '2026-03-06 09:00:00', 0),

(1007, 'doc_20260307_security_audit.pdf', '安全审计报告Q1.pdf', '/knowledge/reports/2026/03/security_audit.pdf', 'kba-knowledge', 'application/pdf', 4194304, '7890123456789012345678901234bcde', 'minio', 2, 1002, '2026-03-07 13:30:00', '2026-03-07 13:30:00', 0),

(1008, 'doc_20260308_ml_pipeline.md', '机器学习流水线设计.md', '/knowledge/docs/2026/03/ml_pipeline.md', 'kba-knowledge', 'text/markdown', 76800, '8901234567890123456789012345cdef', 'minio', 1, 1003, '2026-03-08 10:00:00', '2026-03-08 10:00:00', 0),

(1009, 'doc_20260309_performance.pptx', '性能测试报告.pptx', '/knowledge/presentations/2026/03/performance.pptx', 'kba-knowledge', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 2621440, '9012345678901234567890123456def0', 'minio', 2, 1001, '2026-03-09 15:00:00', '2026-03-09 15:00:00', 0),

(1010, 'doc_20260310_integration.json', '系统集成配置.json', '/knowledge/configs/2026/03/integration.json', 'kba-knowledge', 'application/json', 8192, '0123456789012345678901234567ef01', 'minio', 1, 1002, '2026-03-10 08:30:00', '2026-03-10 08:30:00', 0);