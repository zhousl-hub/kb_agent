import type { KnowledgeSpace, Document, Assistant, ChatSession, ChatMessage, AssistantSession, AssistantMessage } from '@/types'

export const mockKnowledgeSpaces: KnowledgeSpace[] = [
  {
    id: 'ks-001',
    name: '产品文档',
    description: '公司所有产品相关文档，包括产品说明书、用户手册、功能介绍等',
    icon: 'folder',
    type: 'general',
    embeddingModel: 'text-embedding-ada-002',
    documentCount: 156,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-10T10:30:00Z'
  },
  {
    id: 'ks-002',
    name: '技术文档',
    description: '技术架构文档、API文档、开发指南、最佳实践等',
    icon: 'code',
    type: 'general',
    embeddingModel: 'text-embedding-ada-002',
    documentCount: 243,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-03-10T11:45:00Z'
  },
  {
    id: 'ks-003',
    name: '培训资料',
    description: '员工培训课程、入职指南、技能提升材料等',
    icon: 'education',
    type: 'general',
    embeddingModel: 'text-embedding-ada-002',
    documentCount: 89,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-03-09T16:20:00Z'
  },
  {
    id: 'ks-004',
    name: '政策法规',
    description: '公司规章制度、行业法规、合规要求等文档',
    icon: 'document',
    type: 'general',
    embeddingModel: 'text-embedding-ada-002',
    documentCount: 67,
    createdAt: '2024-02-10T08:30:00Z',
    updatedAt: '2024-03-08T14:00:00Z'
  },
  {
    id: 'ks-005',
    name: '销售资料',
    description: '销售话术、客户案例、竞品分析、销售培训材料',
    icon: 'chart',
    type: 'general',
    embeddingModel: 'text-embedding-ada-002',
    documentCount: 134,
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-03-10T09:15:00Z'
  },
  {
    id: 'ks-006',
    name: '运营手册',
    description: '运营流程、操作指南、问题处理手册等',
    icon: 'setting',
    type: 'general',
    embeddingModel: 'text-embedding-ada-002',
    documentCount: 78,
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-03-07T17:30:00Z'
  }
]

export const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    spaceId: 'ks-001',
    docName: '智能客服系统产品说明书.pdf',
    docType: 'pdf',
    fileSize: 2456789,
    processStatus: 'completed',
    segmentCount: 128,
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 'doc-002',
    spaceId: 'ks-001',
    docName: '数据分析平台用户手册.docx',
    docType: 'docx',
    fileSize: 1567890,
    processStatus: 'completed',
    segmentCount: 86,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  },
  {
    id: 'doc-003',
    spaceId: 'ks-002',
    docName: 'API接口文档v2.0.md',
    docType: 'md',
    fileSize: 456789,
    processStatus: 'completed',
    segmentCount: 234,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  },
  {
    id: 'doc-004',
    spaceId: 'ks-002',
    docName: '微服务架构设计指南.pdf',
    docType: 'pdf',
    fileSize: 3456789,
    processStatus: 'completed',
    segmentCount: 167,
    createdAt: '2024-01-21T14:00:00Z',
    updatedAt: '2024-01-21T14:45:00Z'
  },
  {
    id: 'doc-005',
    spaceId: 'ks-003',
    docName: '新员工入职培训手册.pdf',
    docType: 'pdf',
    fileSize: 2345678,
    processStatus: 'completed',
    segmentCount: 98,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:30:00Z'
  },
  {
    id: 'doc-006',
    spaceId: 'ks-003',
    docName: '销售技能培训材料.pptx',
    docType: 'pdf',
    fileSize: 5678901,
    processStatus: 'processing',
    segmentCount: 0,
    createdAt: '2024-03-10T11:00:00Z',
    updatedAt: '2024-03-10T11:00:00Z'
  },
  {
    id: 'doc-007',
    spaceId: 'ks-004',
    docName: '公司员工手册2024版.docx',
    docType: 'docx',
    fileSize: 1234567,
    processStatus: 'completed',
    segmentCount: 56,
    createdAt: '2024-02-10T08:30:00Z',
    updatedAt: '2024-02-10T09:00:00Z'
  },
  {
    id: 'doc-008',
    spaceId: 'ks-005',
    docName: '客户案例集锦.pdf',
    docType: 'pdf',
    fileSize: 8901234,
    processStatus: 'completed',
    segmentCount: 189,
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z'
  },
  {
    id: 'doc-009',
    spaceId: 'ks-005',
    docName: '竞品分析报告.xlsx',
    docType: 'xlsx',
    fileSize: 2345678,
    processStatus: 'completed',
    segmentCount: 45,
    createdAt: '2024-02-16T14:00:00Z',
    updatedAt: '2024-02-16T14:30:00Z'
  },
  {
    id: 'doc-010',
    spaceId: 'ks-006',
    docName: '客服问题处理流程.md',
    docType: 'md',
    fileSize: 123456,
    processStatus: 'completed',
    segmentCount: 34,
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:15:00Z'
  }
]

export const mockAssistants: Assistant[] = [
  {
    id: 'asst-001',
    name: '智能客服助手',
    description: '专业的客服助手，可以帮助解答客户问题、处理投诉、提供服务指引',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=customer-service',
    category: '客服',
    capabilities: ['问题解答', '投诉处理', '服务指引', '常见问题查询'],
    systemPrompt: '你是一个专业的客服助手，请用友好、专业的态度回答用户问题。',
    isMyAssistant: true,
    isPopular: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z'
  },
  {
    id: 'asst-002',
    name: '销售助手',
    description: '销售业务助手，提供产品介绍、报价查询、客户跟进建议等支持',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sales',
    category: '销售',
    capabilities: ['产品介绍', '报价查询', '客户跟进', '销售话术'],
    systemPrompt: '你是一个专业的销售助手，请帮助销售人员进行客户沟通和产品推广。',
    isMyAssistant: false,
    isPopular: true,
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-03-09T15:30:00Z'
  },
  {
    id: 'asst-003',
    name: '研发助手',
    description: '技术支持助手，协助开发人员查询技术文档、代码示例、最佳实践',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=developer',
    category: '研发',
    capabilities: ['技术文档查询', '代码示例', 'API说明', '问题排查'],
    systemPrompt: '你是一个专业的研发助手，请帮助开发人员解决技术问题。',
    isMyAssistant: true,
    isPopular: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-10T11:00:00Z'
  },
  {
    id: 'asst-004',
    name: '运营助手',
    description: '运营业务助手，协助处理日常运营事务、数据分析、活动策划',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=operations',
    category: '运营',
    capabilities: ['数据分析', '活动策划', '用户运营', '内容管理'],
    systemPrompt: '你是一个专业的运营助手，请帮助运营人员处理日常业务。',
    isMyAssistant: false,
    isPopular: true,
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-03-08T16:45:00Z'
  }
]

export const mockChatSessions: ChatSession[] = [
  {
    id: 'sess-001',
    title: '如何使用智能客服系统？',
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2024-03-10T09:30:00Z'
  },
  {
    id: 'sess-002',
    title: 'API接口调用问题',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:45:00Z'
  },
  {
    id: 'sess-003',
    title: '新员工入职流程咨询',
    createdAt: '2024-03-09T14:00:00Z',
    updatedAt: '2024-03-09T14:20:00Z'
  },
  {
    id: 'sess-004',
    title: '销售报价策略讨论',
    createdAt: '2024-03-09T16:00:00Z',
    updatedAt: '2024-03-09T16:30:00Z'
  },
  {
    id: 'sess-005',
    title: '数据分析平台功能介绍',
    createdAt: '2024-03-08T11:00:00Z',
    updatedAt: '2024-03-08T11:45:00Z'
  }
]

export const mockChatMessages: Record<string, ChatMessage[]> = {
  'sess-001': [
    {
      id: 'msg-001',
      role: 'user',
      content: '如何使用智能客服系统？',
      createdAt: '2024-03-10T09:00:00Z'
    },
    {
      id: 'msg-002',
      role: 'assistant',
      content: '智能客服系统使用步骤如下：\n\n1. **登录系统**\n   使用您的员工账号登录智能客服平台\n\n2. **配置知识库**\n   在后台管理系统中配置知识库，添加常见问题及答案\n\n3. **设置机器人**\n   根据业务需求配置对话流程和自动回复规则\n\n4. **接入渠道**\n   支持网页、微信、APP等多渠道接入\n\n5. **监控优化**\n   通过数据看板监控服务效果，持续优化知识库\n\n详细操作请参考《智能客服系统产品说明书》第3-5章。',
      references: [
        {
          id: 'ref-001',
          title: '智能客服系统产品说明书.pdf',
          content: '智能客服系统是一款基于AI技术的客户服务解决方案...',
          score: 0.95,
          source: 'ks-001'
        }
      ],
      createdAt: '2024-03-10T09:00:30Z'
    },
    {
      id: 'msg-003',
      role: 'user',
      content: '支持哪些接入渠道？',
      createdAt: '2024-03-10T09:05:00Z'
    },
    {
      id: 'msg-004',
      role: 'assistant',
      content: '智能客服系统支持以下接入渠道：\n\n**网页端**\n- 支持PC和移动端网页嵌入\n- 提供标准JS SDK，可快速集成\n\n**微信生态**\n- 微信公众号\n- 微信小程序\n- 企业微信\n\n**APP接入**\n- 提供iOS/Android SDK\n- 支持React Native/Flutter等跨平台框架\n\n**其他渠道**\n- 抖音私信\n- 钉钉机器人\n- 飞书机器人\n\n系统支持统一后台管理所有渠道的对话，实现全渠道客服一体化。',
      references: [
        {
          id: 'ref-002',
          title: '智能客服系统产品说明书.pdf',
          content: '渠道接入配置...',
          score: 0.92,
          source: 'ks-001'
        }
      ],
      createdAt: '2024-03-10T09:05:20Z'
    }
  ],
  'sess-002': [
    {
      id: 'msg-005',
      role: 'user',
      content: 'API接口如何进行身份认证？',
      createdAt: '2024-03-10T10:00:00Z'
    },
    {
      id: 'msg-006',
      role: 'assistant',
      content: 'API身份认证采用Bearer Token方式：\n\n**获取Token**\n```bash\nPOST /api/v1/auth/token\nContent-Type: application/json\n\n{\n  \"username\": \"your_username\",\n  \"password\": \"your_password\"\n}\n```\n\n**使用Token**\n```bash\nGET /api/v1/knowledge/list\nAuthorization: Bearer <your_token>\n```\n\n**Token有效期**\n- Access Token: 2小时\n- Refresh Token: 7天\n\n建议使用Refresh Token机制保持长期会话。',
      references: [
        {
          id: 'ref-003',
          title: 'API接口文档v2.0.md',
          content: '身份认证模块...',
          score: 0.98,
          source: 'ks-002'
        }
      ],
      createdAt: '2024-03-10T10:00:45Z'
    }
  ],
  'sess-003': [
    {
      id: 'msg-007',
      role: 'user',
      content: '新员工入职需要准备什么材料？',
      createdAt: '2024-03-09T14:00:00Z'
    },
    {
      id: 'msg-008',
      role: 'assistant',
      content: '新员工入职需要准备以下材料：\n\n**必需材料**\n1. 身份证原件及复印件（正反面）\n2. 学历证书原件及复印件\n3. 学位证书原件及复印件\n4. 离职证明（上一家公司）\n5. 体检报告（三级甲等医院）\n6. 一寸照片4张\n\n**可选材料**\n- 银行卡复印件（工资卡）\n- 社保转移单\n- 专业资格证书\n\n入职当天请携带所有材料至人力资源部办理入职手续。',
      references: [
        {
          id: 'ref-004',
          title: '新员工入职培训手册.pdf',
          content: '入职材料清单...',
          score: 0.96,
          source: 'ks-003'
        }
      ],
      createdAt: '2024-03-09T14:00:30Z'
    }
  ]
}

export const mockAssistantSessions: AssistantSession[] = [
  {
    id: 'asst-sess-001',
    assistantId: 'asst-001',
    title: '客户投诉处理咨询',
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-03-10T08:30:00Z'
  },
  {
    id: 'asst-sess-002',
    assistantId: 'asst-002',
    title: '产品报价方案讨论',
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2024-03-10T09:45:00Z'
  },
  {
    id: 'asst-sess-003',
    assistantId: 'asst-003',
    title: '代码调试问题排查',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T11:00:00Z'
  },
  {
    id: 'asst-sess-004',
    assistantId: 'asst-004',
    title: '活动策划方案讨论',
    createdAt: '2024-03-09T15:00:00Z',
    updatedAt: '2024-03-09T16:00:00Z'
  }
]

export const mockAssistantMessages: Record<string, AssistantMessage[]> = {
  'asst-sess-001': [
    {
      id: 'amsg-001',
      role: 'user',
      content: '客户投诉说产品有质量问题，要求退款，我该怎么处理？',
      createdAt: '2024-03-10T08:00:00Z'
    },
    {
      id: 'amsg-002',
      role: 'assistant',
      content: '处理客户质量投诉的标准流程：\n\n**第一步：安抚情绪**\n- 首先表示歉意，认可客户感受\n- "非常抱歉给您带来不好的体验，我们非常重视您反馈的问题"\n\n**第二步：了解详情**\n- 询问具体问题现象\n- 了解购买时间、使用场景\n- 是否有照片或视频证据\n\n**第三步：解决方案**\n- 符合退换货条件：立即办理退款\n- 可维修：安排上门服务\n- 协商补偿：优惠券/积分\n\n**第四步：跟进回访**\n- 3天内回访确认问题解决\n- 记录案例用于改进\n\n需要我提供具体话术模板吗？',
      createdAt: '2024-03-10T08:00:20Z'
    }
  ],
  'asst-sess-002': [
    {
      id: 'amsg-003',
      role: 'user',
      content: '客户需要采购100套企业版，给什么折扣合适？',
      createdAt: '2024-03-10T09:00:00Z'
    },
    {
      id: 'amsg-004',
      role: 'assistant',
      content: '根据公司报价策略，100套企业版采购建议：\n\n**基础报价**\n- 企业版单价：¥9,999/套\n- 标准总价：¥999,900\n\n**建议折扣方案**\n1. **首次合作**：85折 + 2年免费维护\n2. **老客户续约**：8折 + 赠送培训\n3. **战略客户**：75折 + 定制开发支持\n\n**增值服务包**\n- 优先技术支持：+5%\n- 定制培训服务：+3%\n- 数据迁移服务：+2%\n\n**谈判策略**\n- 先报88折试探\n- 底线为75折\n- 用增值服务作为谈判筹码\n\n需要我生成正式报价单吗？',
      createdAt: '2024-03-10T09:00:25Z'
    }
  ],
  'asst-sess-003': [
    {
      id: 'amsg-005',
      role: 'user',
      content: '这个API调用一直返回401错误，帮我看看代码哪里有问题？',
      createdAt: '2024-03-10T10:00:00Z'
    },
    {
      id: 'amsg-006',
      role: 'assistant',
      content: '401错误通常是认证问题，请检查以下几项：\n\n**常见原因**\n\n1. **Token过期**\n```javascript\n// 检查token是否过期\nconst token = localStorage.getItem(\'token\')\nconst payload = JSON.parse(atob(token.split(\'.\')[1]))\nif (payload.exp * 1000 < Date.now()) {\n  // token已过期，需要刷新\n}\n```\n\n2. **Token格式错误**\n```javascript\n// 正确格式\nheaders: {\n  \'Authorization\': `Bearer ${token}`  // 注意Bearer前缀\n}\n```\n\n3. **跨域问题**\n```javascript\n// 确保withCredentials\naxios.defaults.withCredentials = true\n```\n\n**调试步骤**\n1. 在控制台打印当前token\n2. 检查请求头是否正确携带Authorization\n3. 使用Postman测试API是否正常\n4. 检查后端日志确认具体错误\n\n请提供您的代码片段，我帮您具体分析。',
      createdAt: '2024-03-10T10:00:30Z'
    }
  ]
}

export const mockSearchResults = [
  {
    id: 'sr-001',
    documentId: 'doc-001',
    documentName: '智能客服系统产品说明书.pdf',
    knowledgeId: 'ks-001',
    knowledgeName: '产品文档',
    content: '智能客服系统是一款基于AI技术的客户服务解决方案，支持多渠道接入、智能问答、工单管理等功能...',
    score: 0.95,
    highlight: '<em>智能客服系统</em>是一款基于AI技术的客户服务解决方案...'
  },
  {
    id: 'sr-002',
    documentId: 'doc-003',
    documentName: 'API接口文档v2.0.md',
    knowledgeId: 'ks-002',
    knowledgeName: '技术文档',
    content: 'API接口采用RESTful风格设计，支持JSON数据格式，所有接口需要进行身份认证...',
    score: 0.88,
    highlight: '<em>API接口</em>采用RESTful风格设计...'
  },
  {
    id: 'sr-003',
    documentId: 'doc-005',
    documentName: '新员工入职培训手册.pdf',
    knowledgeId: 'ks-003',
    knowledgeName: '培训资料',
    content: '新员工入职需要准备以下材料...',
    score: 0.82,
    highlight: '<em>新员工入职</em>需要准备以下材料...'
  }
]

export const mockRecentDocuments = [
  {
    id: 'doc-001',
    title: '智能客服系统产品说明书.pdf',
    type: 'document',
    knowledgeId: 'ks-001',
    knowledgeName: '产品文档',
    updatedAt: '2小时前'
  },
  {
    id: 'doc-003',
    title: 'API接口文档v2.0.md',
    type: 'document',
    knowledgeId: 'ks-002',
    knowledgeName: '技术文档',
    updatedAt: '昨天'
  },
  {
    id: 'doc-005',
    title: '新员工入职培训手册.pdf',
    type: 'document',
    knowledgeId: 'ks-003',
    knowledgeName: '培训资料',
    updatedAt: '3天前'
  },
  {
    id: 'doc-007',
    title: '公司员工手册2024版.docx',
    type: 'document',
    knowledgeId: 'ks-004',
    knowledgeName: '政策法规',
    updatedAt: '5天前'
  },
  {
    id: 'doc-008',
    title: '客户案例集锦.pdf',
    type: 'document',
    knowledgeId: 'ks-005',
    knowledgeName: '销售资料',
    updatedAt: '1周前'
  }
]

export const mockUserTodos = [
  {
    id: 'todo-1',
    content: '完成项目文档编写',
    completed: false,
    createdAt: '2024-03-10T08:00:00Z'
  },
  {
    id: 'todo-2',
    content: '参加团队周会',
    completed: false,
    createdAt: '2024-03-10T09:00:00Z'
  },
  {
    id: 'todo-3',
    content: '提交周报',
    completed: true,
    createdAt: '2024-03-09T14:00:00Z'
  },
  {
    id: 'todo-4',
    content: '审核PRD文档',
    completed: false,
    createdAt: '2024-03-10T10:00:00Z'
  }
]

export const mockKnowledgeStats = {
  trendData: [65, 59, 80, 81, 56, 55, 40],
  categoryData: [
    { name: '产品文档', value: 300 },
    { name: '技术文档', value: 150 },
    { name: '营销资料', value: 100 },
    { name: '培训材料', value: 80 },
    { name: '其他', value: 70 }
  ]
}

export const mockUserProfile = {
  id: 'user-001',
  username: 'demo_user',
  email: 'demo@example.com',
  nickname: 'Demo User',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  phone: '138****8888',
  department: '技术研发部',
  position: '高级工程师',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-03-10T10:00:00Z'
}

export const mockTags = [
  { id: 'tag-001', name: '产品', count: 156 },
  { id: 'tag-002', name: '技术', count: 243 },
  { id: 'tag-003', name: '培训', count: 89 },
  { id: 'tag-004', name: '政策', count: 67 },
  { id: 'tag-005', name: '销售', count: 134 },
  { id: 'tag-006', name: '运营', count: 78 },
  { id: 'tag-007', name: '客服', count: 45 },
  { id: 'tag-008', name: '人力资源', count: 32 }
]

export const mockFavorites = [
  { id: 'fav-001', documentId: 'doc-001', documentName: '智能客服系统产品说明书.pdf', knowledgeId: 'ks-001', knowledgeName: '产品文档', createdAt: '2024-03-08T10:00:00Z' },
  { id: 'fav-002', documentId: 'doc-003', documentName: 'API接口文档v2.0.md', knowledgeId: 'ks-002', knowledgeName: '技术文档', createdAt: '2024-03-07T14:30:00Z' },
  { id: 'fav-003', documentId: 'doc-005', documentName: '新员工入职培训手册.pdf', knowledgeId: 'ks-003', knowledgeName: '培训资料', createdAt: '2024-03-05T09:15:00Z' }
]

export const mockReports = [
  {
    id: 'report-001',
    title: '2024年度产品研发总结报告',
    content: '# 2024年度产品研发总结报告\n\n## 一、概述\n\n本报告总结了2024年度产品研发工作的主要成果和经验教训。\n\n## 二、主要成果\n\n1. 完成了智能客服系统2.0版本的开发\n2. 上线了数据分析平台\n3. 优化了系统架构，提升了50%的性能\n\n## 三、技术亮点\n\n- 采用微服务架构\n- 引入AI技术提升用户体验\n- 实现了自动化测试覆盖率85%\n\n## 四、展望\n\n2025年将继续深化AI技术应用，提升产品智能化水平。',
    status: 'published',
    version: 3,
    authorId: 'user-001',
    authorName: '张三',
    departmentId: 'dept-001',
    departmentName: '研发部',
    tags: ['年度报告', '研发'],
    publishedAt: '2024-12-30T10:00:00Z',
    createdAt: '2024-12-20T08:00:00Z',
    updatedAt: '2024-12-30T10:00:00Z'
  },
  {
    id: 'report-002',
    title: '用户反馈分析报告',
    content: '# 用户反馈分析报告\n\n## 概述\n\n本报告分析了2024年第四季度的用户反馈数据。\n\n## 反馈统计\n\n- 总反馈数：1,234条\n- 问题反馈：856条\n- 功能建议：378条\n\n## 主要问题\n\n1. 系统响应速度慢（占比35%）\n2. 移动端体验不佳（占比28%）\n3. 文档不够完善（占比15%）\n\n## 改进建议\n\n1. 优化系统性能\n2. 改善移动端UI\n3. 完善产品文档',
    status: 'draft',
    version: 1,
    authorId: 'user-002',
    authorName: '李四',
    departmentId: 'dept-002',
    departmentName: '产品部',
    tags: ['用户反馈', '分析'],
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2024-12-15T09:00:00Z'
  },
  {
    id: 'report-003',
    title: '技术架构升级方案',
    content: '# 技术架构升级方案\n\n## 背景\n\n现有系统架构已无法满足业务快速增长的需求，需要进行升级改造。\n\n## 升级目标\n\n1. 提升系统可扩展性\n2. 降低运维成本\n3. 提高开发效率\n\n## 升级方案\n\n### 微服务拆分\n\n将单体应用拆分为以下微服务：\n- 用户服务\n- 知识库服务\n- 搜索服务\n- AI服务\n\n### 技术选型\n\n- 容器化：Docker + Kubernetes\n- 消息队列：Kafka\n- 缓存：Redis Cluster\n- 数据库：MySQL + Elasticsearch',
    status: 'published',
    version: 2,
    authorId: 'user-001',
    authorName: '张三',
    departmentId: 'dept-001',
    departmentName: '研发部',
    tags: ['技术架构', '升级'],
    publishedAt: '2024-11-20T14:00:00Z',
    createdAt: '2024-11-10T10:00:00Z',
    updatedAt: '2024-11-20T14:00:00Z'
  }
]

export const mockReportVersions: Record<string, Array<{id: string; reportId: string; version: number; content: string; changeSummary?: string; createdBy: string; createdByName: string; createdAt: string; status: number}>> = {
  'report-001': [
    {
      id: 'rv-001-3',
      reportId: 'report-001',
      version: 3,
      content: '# 2024年度产品研发总结报告\n\n## 一、概述\n\n根据公司战略调整，对2024年度产品研发工作进行了深入分析，总结取得的主要成果和经验教训。\n\n## 二、主要成果\n\n1. 完成了智能客服系统2.0版本的开发\n2. 上线了数据分析平台\n3. 优化了系统架构，提升了50%的性能\n\n## 三、技术亮点\n\n- 采用微服务架构\n- 引入AI技术提升用户体验\n- 实现了自动化测试覆盖率85%\n\n## 四、重大发现\n\n本年度最重大的技术突破是实现了智能推荐算法的优化，将用户满意度提升了40%。\n\n## 五、展望\n\n2025年将继续深化AI技术应用，提升产品智能化水平，重点关注大模型应用。',
      changeSummary: '补充了年度数据统计和重大发现部分',
      createdBy: 'user-001',
      createdByName: '张三',
      createdAt: '2024-12-30T10:00:00Z',
      status: 1
    },
    {
      id: 'rv-001-2',
      reportId: 'report-001',
      version: 2,
      content: '# 2024年度产品研发总结报告\n\n## 一、概述\n\n本报告总结了2024年度产品研发工作的主要成果和经验教训。\n\n## 二、主要成果\n\n1. 完成了智能客服系统2.0版本的开发\n2. 上线了数据分析平台\n3. 优化了系统架构，提升了50%的性能\n\n## 三、技术亮点\n\n- 采用微服务架构\n- 引入AI技术提升用户体验\n- 实现了自动化测试覆盖率85%\n\n## 四、展望\n\n2025年将继续深化AI技术应用，提升产品智能化水平。',
      changeSummary: '完善了技术亮点章节，并修正了数据错误',
      createdBy: 'user-001',
      createdByName: '张三',
      createdAt: '2024-12-25T15:00:00Z',
      status: 1
    },
    {
      id: 'rv-001-1',
      reportId: 'report-001',
      version: 1,
      content: '# 2024年度产品研发总结报告\n\n## 一、概述\n\n本报告总结了2024年度产品研发工作的主要成果和经验教训。\n\n## 二、主要成果\n\n1. 完成了智能客服系统2.0版本的开发\n2. 上线了数据分析平台\n3. 部分完成了系统架构的优化\n\n## 三、展望\n\n2025年将继续深度AI技术应用，提升产品智能化水平。',
      changeSummary: '初始版本',
      createdBy: 'user-001',
      createdByName: '张三',
      createdAt: '2024-12-20T08:00:00Z',
      status: 1
    }
  ],
  'report-002': [
    {
      id: 'rv-002-1',
      reportId: 'report-002',
      version: 1,
      content: '# 用户反馈分析报告\n\n## 概述\n\n本报告分析了2024年第四季度的用户反馈数据。\n\n## 反馈统计\n\n- 总反馈数：1,234条\n- 问题反馈：856条\n- 功能建议：378条\n\n## 主要问题\n\n1. 系统响应速度慢（占比35%）\n2. 移动端体验不佳（占比28%）\n3. 文档不够完善（占比15%）\n\n## 改进建议\n\n1. 优化系统性能\n2. 改善移动端UI\n3. 完善产品文档',
      changeSummary: '初步收集的用户反馈分析结果',
      createdBy: 'user-002',
      createdByName: '李四',
      createdAt: '2024-12-15T09:00:00Z',
      status: 1
    }
  ],
  'report-003': [
    {
      id: 'rv-003-2',
      reportId: 'report-003',
      version: 2,
      content: '# 技术架构升级方案\n\n## 背景\n\n现有系统架构已无法满足业务快速增长的需求，需要进行升级改造。\n\n## 升级目标\n\n1. 提升系统可扩展性\n2. 降低运维成本\n3. 提高开发效率\n\n## 升级方案\n\n### 微服务拆分\n\n将单体应用拆分为以下微服务：\n- 用户服务\n- 知识库服务\n- 搜索服务\n- AI服务\n\n### 技术选型\n\n- 容器化：Docker + Kubernetes\n- 消息队列：Kafka\n- 缓存：Redis Cluster\n- 数据库：MySQL + Elasticsearch\n\n### 实施计划\n\n- 阶段一：基础设施搭建（1个月）\n- 阶段二：服务拆分（2个月）\n- 阶段三：性能测试（半月）\n- 阶段四：上线部署（半月）',
      changeSummary: '增加了实施计划和阶段安排',
      createdBy: 'user-001',
      createdByName: '张三',
      createdAt: '2024-11-15T14:00:00Z',
      status: 1
    },
    {
      id: 'rv-003-1',
      reportId: 'report-003',
      version: 1,
      content: '# 技术架构升级方案\n\n## 背景\n\n现有系统架构已无法满足业务快速增长的需求，需要进行升级改造。\n\n## 升级目标\n\n1. 提升系统可扩展性\n2. 降低运维成本\n3. 提高开发效率\n\n## 升级方案\n\n### 微服务拆分\n\n将单体应用拆分为以下微服务：\n- 用户服务\n- 知识库服务\n- 搜索服务\n- AI服务\n\n### 技术选型\n\n- 容器化：Docker + Kubernetes\n- 消息队列：Kafka\n- 缓存：Redis Cluster\n- 数据库：MySQL + Elasticsearch',
      changeSummary: '初步架构升级方案',
      createdBy: 'user-001',
      createdByName: '张三',
      createdAt: '2024-11-10T10:00:00Z',
      status: 1
    }
  ]
}

export const mockReportSearchResults = [
  {
    id: 'rs-001',
    content: '智能客服系统是一款基于AI技术的客户服务解决方案...',
    sourceTitle: '产品文档',
    score: 0.95,
    metadata: { knowledgeId: 'ks-001' }
  },
  {
    id: 'rs-002',
    content: 'API接口采用RESTful风格设计...',
    sourceTitle: '技术文档',
    score: 0.88,
    metadata: { knowledgeId: 'ks-002' }
  }
]