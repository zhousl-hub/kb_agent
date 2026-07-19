-- ====================================
-- KBA Mock Data Supplement
-- Based on frontend mock data (data.ts)
-- ====================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ==================== kba_knowledge ====================

USE kba_knowledge;

-- 添加知识空间所需字段 (MySQL兼容写法)
-- 先检查并添加type列
SET @dbname = DATABASE();
SET @tablename = 'kb_knowledge_space';
SET @columnname = 'type';
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(20) DEFAULT ''general'' COMMENT ''类型: general/structured/qa'' AFTER icon')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 检查并添加embedding_model列
SET @columnname = 'embedding_model';
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) DEFAULT ''text-embedding-ada-002'' COMMENT ''嵌入模型'' AFTER type')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 知识空间数据 (雪花ID格式: 时间戳+机器ID+序列号)
-- 使用ID范围: 1000000000000000001 - 1000000000000000006
INSERT IGNORE INTO kb_knowledge_space (id, tenant_id, name, description, icon, type, embedding_model, document_count, status, created_by, created_at, updated_at) VALUES 
(1000000000000001001, 1, '产品文档', '公司所有产品相关文档，包括产品说明书、用户手册、功能介绍等', 'folder', 'general', 'text-embedding-ada-002', 156, 1, 1, '2024-01-15T08:00:00Z', '2024-03-10T10:30:00Z'),
(1000000000000001002, 1, '技术文档', '技术架构文档、API文档、开发指南、最佳实践等', 'code', 'general', 'text-embedding-ada-002', 243, 1, 1, '2024-01-20T09:00:00Z', '2024-03-10T11:45:00Z'),
(1000000000000001003, 1, '培训资料', '员工培训课程、入职指南、技能提升材料等', 'education', 'general', 'text-embedding-ada-002', 89, 1, 1, '2024-02-01T10:00:00Z', '2024-03-09T16:20:00Z'),
(1000000000000001004, 1, '政策法规', '公司规章制度、行业法规、合规要求等文档', 'document', 'general', 'text-embedding-ada-002', 67, 1, 1, '2024-02-10T08:30:00Z', '2024-03-08T14:00:00Z'),
(1000000000000001005, 1, '销售资料', '销售话术、客户案例、竞品分析、销售培训材料', 'chart', 'general', 'text-embedding-ada-002', 134, 1, 1, '2024-02-15T09:00:00Z', '2024-03-10T09:15:00Z'),
(1000000000000001006, 1, '运营手册', '运营流程、操作指南、问题处理手册等', 'setting', 'general', 'text-embedding-ada-002', 78, 1, 1, '2024-02-20T10:00:00Z', '2024-03-07T17:30:00Z');

-- 文档数据
-- 使用ID范围: 1000000000000002001 - 1000000000000002010
INSERT IGNORE INTO kb_document (id, tenant_id, knowledge_space_id, name, type, size, status, chunk_count, created_by, created_at, updated_at) VALUES 
(1000000000000002001, 1, 1000000000000001001, '智能客服系统产品说明书.pdf', 'pdf', 2456789, 'completed', 128, 1, '2024-01-15T08:30:00Z', '2024-01-15T09:00:00Z'),
(1000000000000002002, 1, 1000000000000001001, '数据分析平台用户手册.docx', 'docx', 1567890, 'completed', 86, 1, '2024-01-16T10:00:00Z', '2024-01-16T10:30:00Z'),
(1000000000000002003, 1, 1000000000000001002, 'API接口文档v2.0.md', 'md', 456789, 'completed', 234, 1, '2024-01-20T09:00:00Z', '2024-01-20T09:15:00Z'),
(1000000000000002004, 1, 1000000000000001002, '微服务架构设计指南.pdf', 'pdf', 3456789, 'completed', 167, 1, '2024-01-21T14:00:00Z', '2024-01-21T14:45:00Z'),
(1000000000000002005, 1, 1000000000000001003, '新员工入职培训手册.pdf', 'pdf', 2345678, 'completed', 98, 1, '2024-02-01T10:00:00Z', '2024-02-01T10:30:00Z'),
(1000000000000002006, 1, 1000000000000001003, '销售技能培训材料.pptx', 'pdf', 5678901, 'processing', 0, 1, '2024-03-10T11:00:00Z', '2024-03-10T11:00:00Z'),
(1000000000000002007, 1, 1000000000000001004, '公司员工手册2024版.docx', 'docx', 1234567, 'completed', 56, 1, '2024-02-10T08:30:00Z', '2024-02-10T09:00:00Z'),
(1000000000000002008, 1, 1000000000000001005, '客户案例集锦.pdf', 'pdf', 8901234, 'completed', 189, 1, '2024-02-15T09:00:00Z', '2024-02-15T10:00:00Z'),
(1000000000000002009, 1, 1000000000000001005, '竞品分析报告.xlsx', 'xlsx', 2345678, 'completed', 45, 1, '2024-02-16T14:00:00Z', '2024-02-16T14:30:00Z'),
(1000000000000002010, 1, 1000000000000001006, '客服问题处理流程.md', 'md', 123456, 'completed', 34, 1, '2024-02-20T10:00:00Z', '2024-02-20T10:15:00Z');

-- ==================== kba_ai ====================

USE kba_ai;

-- 智能助手数据
-- 使用ID范围: 1000000000000003001 - 1000000000000003004
INSERT IGNORE INTO ai_assistant (id, tenant_id, name, description, avatar, category, capabilities, system_prompt, status, created_by, created_at, updated_at) VALUES 
(1000000000000003001, 1, '智能客服助手', '专业的客服助手，可以帮助解答客户问题、处理投诉、提供服务指引', 'https://api.dicebear.com/7.x/bottts/svg?seed=customer-service', '客服', '["问题解答", "投诉处理", "服务指引", "常见问题查询"]', '你是一个专业的客服助手，请用友好、专业的态度回答用户问题。', 1, 1, '2024-01-10T08:00:00Z', '2024-03-10T10:00:00Z'),
(1000000000000003002, 1, '销售助手', '销售业务助手，提供产品介绍、报价查询、客户跟进建议等支持', 'https://api.dicebear.com/7.x/bottts/svg?seed=sales', '销售', '["产品介绍", "报价查询", "客户跟进", "销售话术"]', '你是一个专业的销售助手，请帮助销售人员进行客户沟通和产品推广。', 1, 1, '2024-01-12T09:00:00Z', '2024-03-09T15:30:00Z'),
(1000000000000003003, 1, '研发助手', '技术支持助手，协助开发人员查询技术文档、代码示例、最佳实践', 'https://api.dicebear.com/7.x/bottts/svg?seed=developer', '研发', '["技术文档查询", "代码示例", "API说明", "问题排查"]', '你是一个专业的研发助手，请帮助开发人员解决技术问题。', 1, 1, '2024-01-15T10:00:00Z', '2024-03-10T11:00:00Z'),
(1000000000000003004, 1, '运营助手', '运营业务助手，协助处理日常运营事务、数据分析、活动策划', 'https://api.dicebear.com/7.x/bottts/svg?seed=operations', '运营', '["数据分析", "活动策划", "用户运营", "内容管理"]', '你是一个专业的运营助手，请帮助运营人员处理日常业务。', 1, 1, '2024-01-18T11:00:00Z', '2024-03-08T16:45:00Z');

-- 对话会话数据
-- 使用ID范围: 1000000000000004001 - 1000000000000004005
INSERT IGNORE INTO ai_chat_session (id, tenant_id, app_id, user_id, title, status, created_at, updated_at) VALUES 
(1000000000000004001, 1, 1, 1, '如何使用智能客服系统？', 1, '2024-03-10T09:00:00Z', '2024-03-10T09:30:00Z'),
(1000000000000004002, 1, 1, 1, 'API接口调用问题', 1, '2024-03-10T10:00:00Z', '2024-03-10T10:45:00Z'),
(1000000000000004003, 1, 1, 1, '新员工入职流程咨询', 1, '2024-03-09T14:00:00Z', '2024-03-09T14:20:00Z'),
(1000000000000004004, 1, 1, 1, '销售报价策略讨论', 1, '2024-03-09T16:00:00Z', '2024-03-09T16:30:00Z'),
(1000000000000004005, 1, 1, 1, '数据分析平台功能介绍', 1, '2024-03-08T11:00:00Z', '2024-03-08T11:45:00Z');

-- 对话消息数据 - Session 1
-- 使用ID范围: 1000000000000005001+
INSERT IGNORE INTO ai_chat_message (id, session_id, tenant_id, role, content, `references`, created_at) VALUES 
(1000000000000005001, 1000000000000004001, 1, 'user', '如何使用智能客服系统？', NULL, '2024-03-10T09:00:00Z'),
(1000000000000005002, 1000000000000004001, 1, 'assistant', '智能客服系统使用步骤如下：\n\n1. **登录系统**\n   使用您的员工账号登录智能客服平台\n\n2. **配置知识库**\n   在后台管理系统中配置知识库，添加常见问题及答案\n\n3. **设置机器人**\n   根据业务需求配置对话流程和自动回复规则\n\n4. **接入渠道**\n   支持网页、微信、APP等多渠道接入\n\n5. **监控优化**\n   通过数据看板监控服务效果，持续优化知识库\n\n详细操作请参考《智能客服系统产品说明书》第3-5章。', '[{"id": "ref-001", "title": "智能客服系统产品说明书.pdf", "content": "智能客服系统是一款基于AI技术的客户服务解决方案...", "score": 0.95, "source": "ks-001"}]', '2024-03-10T09:00:30Z'),
(1000000000000005003, 1000000000000004001, 1, 'user', '支持哪些接入渠道？', NULL, '2024-03-10T09:05:00Z'),
(1000000000000005004, 1000000000000004001, 1, 'assistant', '智能客服系统支持以下接入渠道：\n\n**网页端**\n- 支持PC和移动端网页嵌入\n- 提供标准JS SDK，可快速集成\n\n**微信生态**\n- 微信公众号\n- 微信小程序\n- 企业微信\n\n**APP接入**\n- 提供iOS/Android SDK\n- 支持React Native/Flutter等跨平台框架\n\n**其他渠道**\n- 抖音私信\n- 钉钉机器人\n- 飞书机器人\n\n系统支持统一后台管理所有渠道的对话，实现全渠道客服一体化。', '[{"id": "ref-002", "title": "智能客服系统产品说明书.pdf", "content": "渠道接入配置...", "score": 0.92, "source": "ks-001"}]', '2024-03-10T09:05:20Z');

-- 对话消息数据 - Session 2
INSERT IGNORE INTO ai_chat_message (id, session_id, tenant_id, role, content, `references`, created_at) VALUES 
(1000000000000005005, 1000000000000004002, 1, 'user', 'API接口如何进行身份认证？', NULL, '2024-03-10T10:00:00Z'),
(1000000000000005006, 1000000000000004002, 1, 'assistant', 'API身份认证采用Bearer Token方式：\n\n**获取Token**\n```bash\nPOST /api/v1/auth/token\nContent-Type: application/json\n\n{\n  \"username\": \"your_username\",\n  \"password\": \"your_password\"\n}\n```\n\n**使用Token**\n```bash\nGET /api/v1/knowledge/list\nAuthorization: Bearer <your_token>\n```\n\n**Token有效期**\n- Access Token: 2小时\n- Refresh Token: 7天\n\n建议使用Refresh Token机制保持长期会话。', '[{"id": "ref-003", "title": "API接口文档v2.0.md", "content": "身份认证模块...", "score": 0.98, "source": "ks-002"}]', '2024-03-10T10:00:45Z');

-- 对话消息数据 - Session 3
INSERT IGNORE INTO ai_chat_message (id, session_id, tenant_id, role, content, `references`, created_at) VALUES 
(1000000000000005007, 1000000000000004003, 1, 'user', '新员工入职需要准备什么材料？', NULL, '2024-03-09 14:00:00'),
(1000000000000005008, 1000000000000004003, 1, 'assistant', '新员工入职需要准备以下材料：\n\n**必需材料**\n1. 身份证原件及复印件（正反面）\n2. 学历证书原件及复印件\n3. 学位证书原件及复印件\n4. 离职证明（上一家公司）\n5. 体检报告（三级甲等医院）\n6. 一寸照片4张\n\n**可选材料**\n- 银行卡复印件（工资卡）\n- 社保转移单\n- 专业资格证书\n\n入职当天请携带所有材料至人力资源部办理入职手续。', '[{"id": "ref-004", "title": "新员工入职培训手册.pdf", "content": "入职材料清单...", "score": 0.96, "source": "ks-003"}]', '2024-03-09 14:00:30');

-- 对话消息数据 - Session 4
INSERT IGNORE INTO ai_chat_message (id, session_id, tenant_id, role, content, `references`, created_at) VALUES 
(1000000000000005009, 1000000000000004004, 1, 'user', '销售报价策略有哪些？', NULL, '2024-03-09 16:00:00'),
(1000000000000005010, 1000000000000004004, 1, 'assistant', '销售报价策略包括：\n\n1. **成本加成定价**\n   - 在成本基础上加一定利润率\n   - 适合标准化产品\n\n2. **竞争导向定价**\n   - 参考竞争对手价格\n   - 市场竞争激烈时使用\n\n3. **价值导向定价**\n   - 基于客户感知价值\n   - 适合差异化产品\n\n4. **动态定价**\n   - 根据需求波动调整\n   - 适合季节性产品\n\n详细内容请参考销售培训资料。', '[{"id": "ref-005", "title": "销售培训材料.pdf", "content": "报价策略...", "score": 0.91, "source": "ks-005"}]', '2024-03-09 16:00:30');

-- 对话消息数据 - Session 5
INSERT IGNORE INTO ai_chat_message (id, session_id, tenant_id, role, content, `references`, created_at) VALUES 
(1000000000000005011, 1000000000000004005, 1, 'user', '数据分析平台有哪些核心功能？', NULL, '2024-03-08 11:00:00'),
(1000000000000005012, 1000000000000004005, 1, 'assistant', '数据分析平台核心功能：\n\n**数据接入**\n- 支持多种数据源：MySQL、PostgreSQL、Excel、API\n- 自动数据清洗和转换\n\n**数据分析**\n- SQL查询编辑器\n- 可视化图表生成\n- 自定义报表模板\n\n**智能洞察**\n- AI驱动的数据洞察\n- 异常检测和预警\n- 趋势预测分析\n\n**协作共享**\n- 团队协作空间\n- 报表分享和订阅\n\n详细使用方法请参考用户手册。', '[{"id": "ref-006", "title": "数据分析平台用户手册.docx", "content": "平台功能介绍...", "score": 0.94, "source": "ks-001"}]', '2024-03-08 11:00:30');

-- 助手会话数据 (对应 mockAssistantSessions)
-- 使用ID范围: 1000000000000006001 - 1000000000000006004
INSERT IGNORE INTO ai_assistant_session (id, tenant_id, assistant_id, user_id, title, status, created_at, updated_at) VALUES 
(1000000000000006001, 1, 1000000000000003001, 1, '客户投诉处理咨询', 1, '2024-03-10T08:00:00Z', '2024-03-10T08:30:00Z'),
(1000000000000006002, 1, 1000000000000003002, 1, '产品报价方案讨论', 1, '2024-03-10T09:00:00Z', '2024-03-10T09:45:00Z'),
(1000000000000006003, 1, 1000000000000003003, 1, '代码调试问题排查', 1, '2024-03-10T10:00:00Z', '2024-03-10T11:00:00Z'),
(1000000000000006004, 1, 1000000000000003004, 1, '活动策划方案讨论', 1, '2024-03-09T15:00:00Z', '2024-03-09T16:00:00Z');

-- 助手消息数据 (对应 mockAssistantMessages)
-- 使用ID范围: 1000000000000007001+
INSERT IGNORE INTO ai_assistant_message (id, session_id, tenant_id, role, content, created_at) VALUES 
(1000000000000007001, 1000000000000006001, 1, 'user', '客户投诉说产品有质量问题，要求退款，我该怎么处理？', '2024-03-10T08:00:00Z'),
(1000000000000007002, 1000000000000006001, 1, 'assistant', '处理客户质量投诉的标准流程：\n\n**第一步：安抚情绪**\n- 首先表示歉意，认可客户感受\n- "非常抱歉给您带来不好的体验，我们非常重视您反馈的问题"\n\n**第二步：了解详情**\n- 询问具体问题现象\n- 了解购买时间、使用场景\n- 是否有照片或视频证据\n\n**第三步：解决方案**\n- 符合退换货条件：立即办理退款\n- 可维修：安排上门服务\n- 协商补偿：优惠券/积分\n\n**第四步：跟进回访**\n- 3天内回访确认问题解决\n- 记录案例用于改进\n\n需要我提供具体话术模板吗？', '2024-03-10T08:00:20Z'),
(1000000000000007003, 1000000000000006002, 1, 'user', '客户需要采购100套企业版，给什么折扣合适？', '2024-03-10T09:00:00Z'),
(1000000000000007004, 1000000000000006002, 1, 'assistant', '根据公司报价策略，100套企业版采购建议：\n\n**基础报价**\n- 企业版单价：¥9,999/套\n- 标准总价：¥999,900\n\n**建议折扣方案**\n1. **首次合作**：85折 + 2年免费维护\n2. **老客户续约**：8折 + 赠送培训\n3. **战略客户**：75折 + 定制开发支持\n\n**增值服务包**\n- 优先技术支持：+5%\n- 定制培训服务：+3%\n- 数据迁移服务：+2%\n\n**谈判策略**\n- 先报88折试探\n- 底线为75折\n- 用增值服务作为谈判筹码\n\n需要我生成正式报价单吗？', '2024-03-10T09:00:25Z'),
(1000000000000007005, 1000000000000006003, 1, 'user', '这个API调用一直返回401错误，帮我看看代码哪里有问题？', '2024-03-10T10:00:00Z'),
(1000000000000007006, 1000000000000006003, 1, 'assistant', '401错误通常是认证问题，请检查以下几项：\n\n**常见原因**\n\n1. **Token过期**\n```javascript\n// 检查token是否过期\nconst token = localStorage.getItem(''token'')\nconst payload = JSON.parse(atob(token.split(''.'')[1]))\nif (payload.exp * 1000 < Date.now()) {\n  // token已过期，需要刷新\n}\n```\n\n2. **Token格式错误**\n```javascript\n// 正确格式\nheaders: {\n  ''Authorization'': `Bearer ${token}`  // 注意Bearer前缀\n}\n```\n\n3. **跨域问题**\n```javascript\n// 确保withCredentials\naxios.defaults.withCredentials = true\n```\n\n**调试步骤**\n1. 在控制台打印当前token\n2. 检查请求头是否正确携带Authorization\n3. 使用Postman测试API是否正常\n4. 检查后端日志确认具体错误\n\n请提供您的代码片段，我帮您具体分析。', '2024-03-10T10:00:30Z');

-- ==================== kba_identity ====================

USE kba_identity;

-- 用户档案数据 (对应 mockUserProfile)
-- 使用ID: 1000000000000008001
INSERT IGNORE INTO sys_user (id, tenant_id, username, email, phone, password_hash, nickname, avatar, dept_id, status, created_at, updated_at) VALUES 
(1000000000000008001, 1, 'demo_user', 'demo@example.com', '13800138888', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Demo User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', 2, 1, '2024-01-01T00:00:00Z', '2024-03-10T10:00:00Z');

-- 为demo_user分配普通用户角色
INSERT IGNORE INTO sys_user_role (user_id, role_id) VALUES (1000000000000008001, 3);

-- ==================== 完成 ====================

SELECT 'Mock data supplement completed!' AS message;