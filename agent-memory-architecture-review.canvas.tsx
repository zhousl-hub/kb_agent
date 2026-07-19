import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Link,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasAction,
  useCanvasState,
  useHostTheme,
  computeDAGLayout,
} from "cursor/canvas";

const repositoryRoot = "/Users/zhoushaolin/Documents/github_repo/kb_agent";

const files = {
  memory: `${repositoryRoot}/code/dify/api/core/memory/token_buffer_memory.py`,
  appRunner: `${repositoryRoot}/code/dify/api/core/app/apps/agent_chat/app_runner.py`,
  baseRunner: `${repositoryRoot}/code/dify/api/core/agent/base_agent_runner.py`,
  historyTransform: `${repositoryRoot}/code/dify/api/core/prompt/agent_history_prompt_transform.py`,
  messageGenerator: `${repositoryRoot}/code/dify/api/core/app/apps/message_based_app_generator.py`,
  savePipeline: `${repositoryRoot}/code/dify/api/core/app/task_pipeline/easy_ui_based_generate_task_pipeline.py`,
  threadExtractor: `${repositoryRoot}/code/dify/api/core/prompt/utils/extract_thread_messages.py`,
  models: `${repositoryRoot}/code/dify/api/models/model.py`,
  workflowModels: `${repositoryRoot}/code/dify/api/models/workflow.py`,
  variableLayer: `${repositoryRoot}/code/dify/api/core/app/layers/conversation_variable_persist_layer.py`,
  variableUpdater: `${repositoryRoot}/code/dify/api/services/conversation_variable_updater.py`,
  llmNode: `${repositoryRoot}/code/dify/api/dify_graph/nodes/llm/node.py`,
  nodeFactory: `${repositoryRoot}/code/dify/api/core/workflow/node_factory.py`,
  chatSession: `${repositoryRoot}/code/backend/kba-ai-application/src/main/java/com/kba/ai/entity/ChatSession.java`,
  chatService: `${repositoryRoot}/code/backend/kba-ai-application/src/main/java/com/kba/ai/service/impl/ChatServiceImpl.java`,
  assistantService: `${repositoryRoot}/code/backend/kba-ai-application/src/main/java/com/kba/ai/service/impl/AssistantSessionServiceImpl.java`,
  difyClient: `${repositoryRoot}/code/backend/kba-ai-application/src/main/java/com/kba/ai/client/DifyWebClient.java`,
};

const sourceLinks = [
  ["LangGraph Persistence", "https://docs.langchain.com/oss/python/langgraph/persistence"],
  ["LangChain Short-term memory", "https://docs.langchain.com/oss/python/langchain/short-term-memory"],
  ["LangChain Long-term memory", "https://docs.langchain.com/oss/python/langchain/long-term-memory"],
  ["LangGraph Memory", "https://docs.langchain.com/oss/python/langgraph/add-memory"],
  ["LangGraph Stores", "https://docs.langchain.com/oss/python/langgraph/stores"],
  ["Memory conceptual guide", "https://docs.langchain.com/oss/python/concepts/memory"],
  [
    "ConversationBufferMemory reference",
    "https://reference.langchain.com/python/langchain-classic/memory/buffer/ConversationBufferMemory",
  ],
];

function FileButton({ path, line }: { path: string; line?: number }) {
  const dispatch = useCanvasAction();
  const relative = path.replace(`${repositoryRoot}/`, "");
  return (
    <Button
      variant="ghost"
      onClick={() =>
        dispatch({
          type: "openFile",
          path,
          selection: line
            ? { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 }
            : undefined,
        })
      }
    >
      {relative}{line ? `:${line}` : ""}
    </Button>
  );
}

function FlowStep({
  index,
  title,
  children,
  file,
  line,
}: {
  index: string;
  title: string;
  children: string;
  file: string;
  line: number;
}) {
  const theme = useHostTheme();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px minmax(0, 1fr)",
        gap: 12,
        padding: "10px 0",
        borderBottom: `1px solid ${theme.stroke.tertiary}`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          background: theme.accent.control,
          color: theme.text.onAccent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        {index}
      </div>
      <Stack gap={5}>
        <Text weight="semibold">{title}</Text>
        <Text tone="secondary" size="small">{children}</Text>
        <Row><FileButton path={file} line={line} /></Row>
      </Stack>
    </div>
  );
}

function Overview() {
  return (
    <Stack gap={18}>
      <Callout tone="danger" title="修订后的核心结论">
        Dify 内部的 TokenBuffer 短期记忆链是完整的；但当前通过 KBA Java 代理调用时，多轮上下文实际失效。
        原因有二：<Code>difyConversationId</Code> 标记为不落库，以及每轮用时间戳生成新的 Dify <Code>user</Code>。
        KBA MySQL 历史只用于前端展示，不会回传给模型。
      </Callout>

      <Grid columns={4} gap={14}>
        <Stat value="失效" label="KBA 多轮召回" tone="danger" />
        <Stat value="4" label="记忆/状态链路" tone="info" />
        <Stat value="完整" label="Dify 内部短期记忆" tone="success" />
        <Stat value="缺失" label="跨会话长期记忆" tone="warning" />
      </Grid>

      <H2>四条实际链路</H2>
      <Grid columns="1fr 1fr" gap={14}>
        <Card size="lg">
          <CardHeader trailing={<Pill active size="sm">P0 断裂</Pill>}>KBA 展示型历史</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>MySQL <Code>ai_chat_*</Code> / <Code>ai_assistant_*</Code> 保存会话与消息，供前端历史页读取。</Text>
              <Text tone="secondary" size="small">不拼接进 Dify 请求；且 conversation_id / user 未稳定绑定。</Text>
              <FileButton path={files.chatService} line={95} />
            </Stack>
          </CardBody>
        </Card>
        <Card size="lg">
          <CardHeader trailing={<Pill size="sm">Dify</Pill>}>消息历史记忆</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>以 <Code>Conversation.id</Code> 为边界，从 <Code>messages</Code> 恢复问答并做 token 裁剪。</Text>
              <Text tone="secondary" size="small">独立调用 Dify 时可用；经当前 KBA 代理时通常拿不到稳定 conversation_id。</Text>
              <FileButton path={files.memory} line={117} />
            </Stack>
          </CardBody>
        </Card>
        <Card size="lg">
          <CardHeader trailing={<Pill size="sm">Agent</Pill>}>工具轨迹记忆</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>从 <Code>MessageAgentThought</Code> 重建 tool call / tool result。</Text>
              <Text tone="secondary" size="small">依赖同一 Dify conversation 才能跨轮生效。</Text>
              <FileButton path={files.baseRunner} line={415} />
            </Stack>
          </CardBody>
        </Card>
        <Card size="lg">
          <CardHeader trailing={<Pill size="sm">Workflow</Pill>}>会话变量 / 暂停快照</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>结构化会话变量持久化；暂停快照用于执行恢复，不是对话记忆。</Text>
              <Text tone="secondary" size="small">不等于语义长期记忆或用户画像。</Text>
              <FileButton path={files.variableLayer} line={22} />
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <H2>能力边界</H2>
      <Table
        headers={["能力", "当前状态", "证据与判断"]}
        rows={[
          ["KBA 经代理的多轮连续性", "实际失效", "difyConversationId 不落库；每轮新 user"],
          ["Dify 独立调用的多轮连续性", "已实现", "Conversation + Message 持久化，按 conversation_id 加载"],
          ["KBA 历史展示", "已实现", "MySQL 消息表供前端读取，不注入模型"],
          ["会话分支隔离", "已实现", "parent_message_id 链回溯，仅取最后线程"],
          ["工具调用历史", "已实现", "MessageAgentThought 重建 tool_calls / ToolPromptMessage"],
          ["上下文窗口控制", "部分实现", "按条数与 token 丢弃最旧消息；没有摘要巩固"],
          ["KBA 会话隔离", "不足", "多数列表/读取/发送接口缺少 user/tenant 归属校验"],
          ["跨会话用户画像", "未实现", "没有 user-scoped Store、profile/facts 或跨会话召回"],
          ["语义长期记忆", "未实现", "没有记忆抽取、embedding、去重与冲突解决"],
        ]}
        rowTone={["danger", "success", "success", "success", "success", "warning", "danger", "danger", "danger"]}
        striped
      />
    </Stack>
  );
}

function ProjectFlow() {
  return (
    <Stack gap={18}>
      <Callout tone="danger" title="链路 0：KBA 代理层实际打断多轮记忆">
        经 KBA 调用时，系统先把消息写入 MySQL 展示表，再调用 Dify；但不会把稳定的 conversation_id 和 user
        传回下一轮。因此 Dify TokenBuffer 再完整，也几乎只能看到当前一轮。
      </Callout>

      <H2>链路 0：KBA 写入与 Dify 请求</H2>
      <div>
        <FlowStep index="1" title="先写用户消息到 MySQL" file={files.chatService} line={87}>
          ChatServiceImpl / AssistantSessionServiceImpl 在调用 Dify 前插入 USER 消息；这些记录只用于历史展示。
        </FlowStep>
        <FlowStep index="2" title="每轮生成新的 Dify user" file={files.chatService} line={95}>
          使用 user- + System.currentTimeMillis()。Dify 按 EndUser 归属校验 conversation，下一轮即使用旧 conversation_id 也会失败。
        </FlowStep>
        <FlowStep index="3" title="请求体只带当前 query" file={files.difyClient} line={37}>
          DifyWebClient 发送 inputs、query、conversation_id、user；不会把 KBA MySQL 历史拼进 prompt。
        </FlowStep>
        <FlowStep index="4" title="difyConversationId 不落库" file={files.chatSession} line={31}>
          ChatSession / AssistantSession 将该字段标记 exist=false。Chat 路径只改内存对象；Assistant 更新方法为空。
        </FlowStep>
        <FlowStep index="5" title="下一轮重新 selectById" file={files.chatService} line={198}>
          重新加载会话后 difyConversationId 回到 null，于是以空 conversation_id 请求 Dify，创建全新会话。
        </FlowStep>
      </div>

      <H2>链路 A：Dify 消息写入与下一轮召回</H2>
      <Text tone="secondary">
        这是 Agent Chat、普通 Chat，以及启用 memory 的 Workflow LLM/Agent 节点共同依赖的基础链路。
        仅在调用方稳定传递同一 conversation_id 与同一 authenticated user 时生效。
      </Text>
      <div>
        <FlowStep index="1" title="创建或复用会话" file={files.messageGenerator} line={163}>
          首轮创建 Conversation；后续请求复用已有对象并更新 updated_at。来源用户分别写入 from_end_user_id 或 from_account_id。
        </FlowStep>
        <FlowStep index="2" title="先落一条空回答 Message" file={files.messageGenerator} line={191}>
          模型执行前写入 query、parent_message_id 与用户附件，answer 暂为空；随后提交事务并把 conversation_id 回填到调用实体。
        </FlowStep>
        <FlowStep index="3" title="按是否存在 conversation_id 启用 memory" file={files.appRunner} line={58}>
          AgentChatAppRunner 创建 TokenBufferMemory；新会话首轮也会在生成器回填 ID 后进入此路径，但当前空消息会被召回逻辑排除。
        </FlowStep>
        <FlowStep index="4" title="查询最近消息并提取当前分支" file={files.memory} line={127}>
          按 created_at 倒序查同一 conversation_id，最多 500 条；extract_thread_messages 根据 parent_message_id 回溯最后分支。
        </FlowStep>
        <FlowStep index="5" title="排除尚未完成的当前消息" file={files.memory} line={145}>
          如果最新记录 answer 为空且 answer_tokens 为 0，则弹出，避免把本轮未生成的空助手回答放入上下文。
        </FlowStep>
        <FlowStep index="6" title="重建文本与附件 PromptMessage" file={files.memory} line={153}>
          每条业务 Message 转为 user + assistant 两条模型消息；MessageFile 根据 belongs_to 分别附到用户或助手消息。
        </FlowStep>
        <FlowStep index="7" title="执行 token 预算裁剪" file={files.memory} line={194}>
          计算整段历史 token，超限时从最旧 PromptMessage 开始逐条删除，直到满足 max_token_limit；没有生成摘要。
        </FlowStep>
        <FlowStep index="8" title="与系统提示、本轮输入合并" file={files.historyTransform} line={33}>
          AgentHistoryPromptTransform 根据剩余 token 从后向前保留完整用户轮次，并把系统消息放回开头。
        </FlowStep>
        <FlowStep index="9" title="生成结束后补齐 Message" file={files.savePipeline} line={375}>
          保存实际 prompt、答案、输入/输出 token、价格、延迟和 metadata；这些记录成为下一轮的历史来源。
        </FlowStep>
      </div>

      <Callout tone="warning" title="两层裁剪并不完全一致">
        <Code>TokenBufferMemory</Code> 可能逐条删除消息，而 Agent 的 <Code>AgentHistoryPromptTransform</Code>
        会按用户轮次边界裁剪。Workflow LLM 节点则直接调用前者；因此不同运行模式对工具调用配对和轮次完整性的保障不一致。
      </Callout>

      <H2>链路 B：Agent 工具轨迹重放</H2>
      <div>
        <FlowStep index="1" title="保存每一步 Agent thought" file={files.baseRunner} line={285}>
          工具名、输入、模型 thought、observation、答案、usage 和附件 ID 持久化到 MessageAgentThought。
        </FlowStep>
        <FlowStep index="2" title="下一轮加载同分支全部历史消息" file={files.baseRunner} line={425}>
          organize_agent_history 再次按 conversation_id 查询并提取线程，跳过当前 Message。
        </FlowStep>
        <FlowStep index="3" title="恢复结构化工具协议" file={files.baseRunner} line={439}>
          对每个历史 thought 生成新的 tool_call_id，重建 AssistantPromptMessage.ToolCall 和对应 ToolPromptMessage。
        </FlowStep>
        <FlowStep index="4" title="调用模型前做整轮 token 裁剪" file={files.historyTransform} line={44}>
          若历史超预算，从最近消息向前收集，并仅在遇到 UserPromptMessage 时确认该轮是否整体保留。
        </FlowStep>
      </div>

      <H2>链路 C：Workflow 会话变量</H2>
      <Text>
        Variable Assigner 节点成功后，持久化层只处理选择器以 <Code>conversation</Code> 开头的变量，
        按复合主键 <Code>(id, conversation_id)</Code> 更新 JSON 字符串并立即提交。
      </Text>
      <Row wrap gap={8}>
        <FileButton path={files.variableLayer} line={22} />
        <FileButton path={files.variableUpdater} line={16} />
        <FileButton path={files.workflowModels} line={1241} />
      </Row>
      <Callout tone="neutral" title="不要混淆 Conversation.summary">
        <Code>Conversation.summary</Code> 主要用于会话标题/摘要展示与索引，不参与 TokenBufferMemory 的上下文压缩，
        因此它不是 LangChain 所说的滚动对话摘要记忆。
      </Callout>
    </Stack>
  );
}

function CodeBlock({ title, code }: { title?: string; code: string }) {
  const theme = useHostTheme();
  return (
    <Stack
      gap={0}
      style={{
        background: theme.fill.tertiary,
        border: `1px solid ${theme.stroke.tertiary}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {title ? (
        <Text
          size="small"
          weight="semibold"
          tone="secondary"
          style={{ padding: "8px 12px", borderBottom: `1px solid ${theme.stroke.tertiary}` }}
        >
          {title}
        </Text>
      ) : null}
      <Text
        size="small"
        style={{
          padding: 12,
          margin: 0,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          whiteSpace: "pre",
          overflow: "auto",
          lineHeight: 1.55,
        }}
      >
        {code}
      </Text>
    </Stack>
  );
}

function LangChainPractices() {
  const [section, setSection] = useCanvasState("lc-section", "biz");
  const sections = [
    ["biz", "业务选型"],
    ["overview", "总览"],
    ["short", "短期记忆"],
    ["context", "裁剪与摘要"],
    ["long", "长期记忆"],
    ["write", "写入策略"],
    ["prod", "生产与迁移"],
    ["e2e", "完整示例"],
  ];

  return (
    <Stack gap={18}>
      <Callout tone="success" title="官方当前模型（LangChain 1.x / LangGraph）">
        记忆拆成两套互补设施：<Code>checkpointer + thread_id</Code> 管短期（单会话状态），
        <Code>store + namespace/key</Code> 管长期（跨会话事实）。生产 Agent 通常同时配置两者，
        再用 middleware 做裁剪/摘要。旧 <Code>ConversationBufferMemory</Code> 等已弃用。
      </Callout>

      <Row gap={8} wrap>
        {sections.map(([id, label]) => (
          <span key={id}>
            <Pill active={section === id} onClick={() => setSection(id)}>
              {label}
            </Pill>
          </span>
        ))}
      </Row>

      {section === "biz" && <LcBusinessFlow />}
      {section === "overview" && <LcOverview />}
      {section === "short" && <LcShortTerm />}
      {section === "context" && <LcContextMgmt />}
      {section === "long" && <LcLongTerm />}
      {section === "write" && <LcWriteStrategy />}
      {section === "prod" && <LcProduction />}
      {section === "e2e" && <LcEndToEnd />}
    </Stack>
  );
}

function MemoryDecisionFlow() {
  const theme = useHostTheme();
  const layout = computeDAGLayout({
    direction: "vertical",
    nodeWidth: 168,
    nodeHeight: 44,
    rankGap: 56,
    nodeGap: 28,
    padding: 12,
    nodes: [
      { id: "intent" },
      { id: "q1" },
      { id: "short" },
      { id: "q2" },
      { id: "semantic" },
      { id: "q3" },
      { id: "episodic" },
      { id: "q4" },
      { id: "procedural" },
      { id: "q5" },
      { id: "summarize" },
      { id: "done" },
    ],
    edges: [
      { from: "intent", to: "q1" },
      { from: "q1", to: "short" },
      { from: "q1", to: "q2" },
      { from: "q2", to: "semantic" },
      { from: "q2", to: "q3" },
      { from: "q3", to: "episodic" },
      { from: "q3", to: "q4" },
      { from: "q4", to: "procedural" },
      { from: "q4", to: "q5" },
      { from: "q5", to: "summarize" },
      { from: "q5", to: "done" },
      { from: "short", to: "done" },
      { from: "semantic", to: "done" },
      { from: "episodic", to: "done" },
      { from: "procedural", to: "done" },
      { from: "summarize", to: "done" },
    ],
  });

  const labels: Record<string, string> = {
    intent: "业务意图/用户请求",
    q1: "只要本会话连续?",
    short: "Checkpointer 短期",
    q2: "跨会话记事实/偏好?",
    semantic: "Store 语义记忆",
    q3: "复用历史成功经验?",
    episodic: "Store 情景记忆",
    q4: "要改行为规则/提示?",
    procedural: "Store 程序性记忆",
    q5: "对话会很长?",
    summarize: "摘要/裁剪中间件",
    done: "组装 Context 调用 Agent",
  };

  const decisionIds = new Set(["q1", "q2", "q3", "q4", "q5"]);
  const actionIds = new Set(["short", "semantic", "episodic", "procedural", "summarize"]);

  return (
    <div style={{ position: "relative", width: layout.width, height: layout.height, margin: "0 auto" }}>
      <svg width={layout.width} height={layout.height} style={{ position: "absolute", inset: 0 }}>
        {layout.edges.map((e, i) => (
          <line
            key={i}
            x1={e.sourceX}
            y1={e.sourceY}
            x2={e.targetX}
            y2={e.targetY}
            stroke={theme.stroke.secondary}
            strokeWidth={1.5}
          />
        ))}
      </svg>
      {layout.nodes.map((n) => {
        const isDecision = decisionIds.has(n.id);
        const isAction = actionIds.has(n.id);
        const bg = isAction ? theme.accent.control : isDecision ? theme.fill.secondary : theme.fill.tertiary;
        const fg = isAction ? theme.text.onAccent : theme.text.primary;
        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              width: 168,
              height: 44,
              boxSizing: "border-box",
              padding: "6px 8px",
              borderRadius: isDecision ? 22 : 8,
              border: `1px solid ${theme.stroke.tertiary}`,
              background: bg,
              color: fg,
              fontSize: 11,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              lineHeight: 1.25,
            }}
          >
            {labels[n.id]}
          </div>
        );
      })}
    </div>
  );
}

function RequestRuntimeFlow() {
  const theme = useHostTheme();
  const layout = computeDAGLayout({
    direction: "horizontal",
    nodeWidth: 140,
    nodeHeight: 48,
    rankGap: 48,
    nodeGap: 24,
    padding: 8,
    nodes: [
      { id: "auth" },
      { id: "thread" },
      { id: "load" },
      { id: "recall" },
      { id: "budget" },
      { id: "run" },
      { id: "write" },
    ],
    edges: [
      { from: "auth", to: "thread" },
      { from: "thread", to: "load" },
      { from: "load", to: "recall" },
      { from: "recall", to: "budget" },
      { from: "budget", to: "run" },
      { from: "run", to: "write" },
    ],
  });
  const labels: Record<string, string> = {
    auth: "1.认证\ntenant/user",
    thread: "2.解析/创建\nthread_id",
    load: "3.加载短期\ncheckpoint",
    recall: "4.召回长期\nStore top-k",
    budget: "5.裁剪/摘要\n控 token",
    run: "6.Agent\n推理+工具",
    write: "7.写回短期\n+可选长期",
  };
  return (
    <div style={{ position: "relative", width: layout.width, height: layout.height }}>
      <svg width={layout.width} height={layout.height} style={{ position: "absolute", inset: 0 }}>
        {layout.edges.map((e, i) => (
          <line
            key={i}
            x1={e.sourceX}
            y1={e.sourceY}
            x2={e.targetX}
            y2={e.targetY}
            stroke={theme.stroke.secondary}
            strokeWidth={1.5}
          />
        ))}
      </svg>
      {layout.nodes.map((n) => (
        <div
          key={n.id}
          style={{
            position: "absolute",
            left: n.x,
            top: n.y,
            width: 140,
            height: 48,
            boxSizing: "border-box",
            padding: 6,
            borderRadius: 8,
            border: `1px solid ${theme.stroke.tertiary}`,
            background: n.id === "run" ? theme.accent.control : theme.fill.tertiary,
            color: n.id === "run" ? theme.text.onAccent : theme.text.primary,
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "pre-line",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {labels[n.id]}
        </div>
      ))}
    </div>
  );
}

function LcBusinessFlow() {
  return (
    <Stack gap={16}>
      <Callout tone="info" title="怎么选记忆方式（先看意图，再选机制）">
        短期记忆回答「这个会话刚才说了什么」；长期记忆回答「这个用户/组织一直是谁、偏好什么、以前怎么做成的」。
        两者经常同时需要，而不是二选一。
      </Callout>

      <H2>业务意图 → 记忆选型决策流</H2>
      <Text tone="secondary" size="small">圆角=判断题；蓝色=应启用的记忆能力；最后统一组装进一次 Agent 调用。</Text>
      <MemoryDecisionFlow />

      <H2>一次在线请求的运行时流程</H2>
      <RequestRuntimeFlow />

      <H2>完整业务场景清单</H2>
      <Table
        headers={["场景", "用户/业务意图", "应选机制", "为什么", "不选什么"]}
        rows={[
          ["多轮客服续聊", "同一会话接着问，要记得上文工单号", "Checkpointer + 稳定 thread_id", "上下文随会话自然增长，恢复成本低", "不要每轮新建 thread；不要把全文塞进向量库当长期记忆"],
          ["用户说请记住我姓张", "跨天、跨会话仍要叫对名字", "Store 语义记忆（Hot path 写入）", "事实与会话解耦，换 thread 仍可召回", "不要只写进 messages；会话一删或超窗就丢"],
          ["新会话仍要简洁中文", "偏好是稳定属性", "Store Profile 或 preferences namespace", "读取简单、可版本化", "不要塞进 system prompt 永久硬编码到所有租户"],
          ["重复排查同类故障", "想复用上次成功步骤", "Store 情景记忆 + 相似检索", "提供 few-shot 轨迹，改善工具选择", "不要把所有原始对话当经验注入"],
          ["人工审核后更新话术", "改 Agent 行为规则", "程序性记忆（版本化 prompt/技能）", "可回滚、可灰度", "不要让终端用户直接改全局 system prompt"],
          ["咨询已聊 80 轮", "既要省 token 又不丢早期约束", "SummarizationMiddleware（+可选 Trim）", "有损压缩但保留要点", "不要只按条数无脑丢最旧消息"],
          ["用户删除对话", "隐私合规，不能再恢复", "delete_thread + 视策略清理 Store", "短期与长期数据面要分别处理", "不要只删前端列表"],
          ["水平扩容 / 滚动发布", "任意实例都能续同一会话", "PostgresSaver / PostgresStore", "状态在 DB，不绑单机内存", "不要 InMemory* 上生产"],
          ["人机协同审批中断", "工具执行到一半等人批准后继续", "Checkpointer（interrupt + 同 thread 恢复）", "图状态可精确暂停恢复", "Store 不保存执行游标"],
          ["知识库问答", "查制度/文档，不是记用户私事", "RAG / 知识库检索", "组织知识与用户记忆分层", "不要把文档切片写成 user namespace 记忆"],
        ]}
        rowTone={["success", "info", "info", "info", "warning", "warning", "danger", "danger", "success", "neutral"]}
        striped
        stickyHeader
      />

      <H2>三类长期记忆与业务字段建议</H2>
      <Grid columns={3} gap={12}>
        <Card>
          <CardHeader>语义记忆</CardHeader>
          <CardBody>
            <Text size="small">姓名、语言、职级、合规约束、默认项目。</Text>
            <Text size="small" tone="secondary">存 Profile 或 facts Collection；带来源与置信度。</Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>情景记忆</CardHeader>
          <CardBody>
            <Text size="small">某次故障怎么修、哪次方案成功/失败。</Text>
            <Text size="small" tone="secondary">存事件摘要+结果，按相似问题召回。</Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>程序性记忆</CardHeader>
          <CardBody>
            <Text size="small">话术、技能、操作手册、提示词版本。</Text>
            <Text size="small" tone="secondary">需审核发布；共享策略建议只读。</Text>
          </CardBody>
        </Card>
      </Grid>

      <Callout tone="warning" title="与 kb_agent 现状的映射">
        修好 KBA 的 <Code>difyConversationId</Code> + 稳定 user 后，才等价于 Checkpointer 短期续聊。
        跨会话偏好/画像仍需单独 Store（或等价服务）；仅靠 Dify TokenBuffer 或 MySQL 展示历史不够。
      </Callout>
    </Stack>
  );
}

function LcOverview() {
  return (
    <Stack gap={16}>
      <H2>两套记忆设施对照</H2>
      <Table
        headers={["维度", "Checkpointer（短期）", "Store（长期）"]}
        rows={[
          ["持久化内容", "整图 State 快照（含 messages）", "应用自定义 JSON 文档"],
          ["作用域", "单个 thread_id", "跨 thread，通常按 user/tenant 命名空间"],
          ["典型用途", "多轮对话、中断恢复、time travel", "用户偏好、事实、经验、规则"],
          ["访问方式", "invoke 时传 configurable.thread_id", "节点/工具里 runtime.store.put/get/search"],
          ["生产后端", "PostgresSaver / AsyncPostgresSaver", "PostgresStore / MongoDBStore / RedisStore"],
          ["开发后端", "InMemorySaver（重启丢失）", "InMemoryStore（重启丢失）"],
        ]}
        striped
      />

      <H2>三类长期记忆（概念）</H2>
      <Table
        headers={["类型", "回答什么问题", "示例", "常见存储形态"]}
        rows={[
          ["语义记忆", "用户/世界的事实是什么？", "姓名、语言偏好、合规约束", "Profile 文档或事实 Collection"],
          ["情景记忆", "过去做过什么、结果如何？", "上次成功排查步骤、失败教训", "事件记录 + 相似检索 few-shot"],
          ["程序性记忆", "应该怎么做？", "系统提示、技能、操作手册", "版本化 prompt / 只读策略文件"],
        ]}
        striped
      />

      <H2>最小心智模型</H2>
      <CodeBlock title="概念伪代码" code={"# 一次请求的记忆视角\nconfig = {{\"configurable\": {{\"thread_id\": \"会话A\"}}}}  # 选中短期记忆\ncontext = Context(user_id=\"u123\")                    # 认证身份 → 长期记忆命名空间\n\nagent.invoke({{\"messages\": [...]}}, config, context=context)\n# 1) checkpointer 恢复该 thread 的 messages/state\n# 2) 工具/中间件用 store.get/search((tenant, user, ...), key) 取长期记忆\n# 3) 模型推理；可选 hot-path 写 store\n# 4) checkpointer 保存新的 state 快照\n"} />
    </Stack>
  );
}

function LcShortTerm() {
  return (
    <Stack gap={16}>
      <H2>为何 InMemorySaver 只适合本地试验？</H2>
      <Callout tone="danger" title="核心原因：状态绑在单进程内存，不具备生产耐久性与可扩展性">
        <Code>InMemorySaver</Code> / <Code>InMemoryStore</Code> 把 checkpoint 放在当前进程的字典里。
        进程退出、OOM、滚动发布、水平扩到多副本后，会话要么丢失，要么在不同实例间对不齐。
      </Callout>

      <Table
        headers={["分析维度", "InMemorySaver / InMemoryStore", "PostgresSaver / PostgresStore（生产）"]}
        rows={[
          ["耐久性", "进程一停数据清空；无法满足“昨天聊到一半今天继续”", "落库，重启/发版后仍可按 thread_id 恢复"],
          ["水平扩展", "多 Pod 各有一份内存；同一 thread 打到不同实例会丢上下文或读到空历史", "共享数据库，任意实例可读同一 checkpoint"],
          ["故障恢复", "宕机即丢；无法做会话级灾备", "可备份、复制、按 checkpoint 恢复/time travel"],
          ["人机协同", "interrupt 后若进程没了，审批续跑失败", "中断状态在 DB，批准后换实例也能 resume"],
          ["可观测/审计", "内存态难审计、难排查“当时模型看到了什么”", "可查历史 checkpoint，便于客服与合规"],
          ["容量与治理", "内存随长会话膨胀，易拖垮 API 进程", "DB 可独立扩容、TTL、归档、按租户隔离"],
          ["安全合规", "难做静态加密、租户级销毁、跨机房同步", "可加密、备份策略、删除 thread 可落地"],
          ["适用阶段", "单机单元测试、本地 Demo、快速验证 prompt", "预发/生产、多副本、长会话、HITL"],
        ]}
        rowTone={["danger", "danger", "danger", "warning", "warning", "warning", "danger", "success"]}
        striped
      />

      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>什么时候可以用 InMemory</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text size="small">本地跑通「同 thread 第二轮能记住名字」。</Text>
              <Text size="small">CI 单测不依赖外部 Postgres。</Text>
              <Text size="small">临时 Demo，明确告知刷新页面/重启即丢。</Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>上生产必须换 DB 后端的信号</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text size="small">K8s / 多副本 / Serverless 冷启动。</Text>
              <Text size="small">需要隔日续聊、会话列表、审计。</Text>
              <Text size="small">需要人工审批中断恢复。</Text>
              <Text size="small">SLA 要求故障后会话不丢。</Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <H2>1. 开发环境：InMemorySaver + thread_id</H2>
      <CodeBlock title="short_term_dev.py" code={"# -*- coding: utf-8 -*-\n\"\"\"短期记忆 · 本地开发示例\n业务意图：验证「同一会话多轮对话能否记住上文」。\n为何用 InMemorySaver：零依赖、启动快；进程退出后数据丢弃，正好适合试验。\n\"\"\"\n\nfrom langchain.agents import create_agent\nfrom langgraph.checkpoint.memory import InMemorySaver\n\ndef get_user_info() -> str:\n    \"\"\"示例工具：模拟查询用户资料。\n    工具结果也会进入短期 State.messages，下一轮仍可见。\n    \"\"\"\n    return \"No user profile on file.\"\n\n# InMemorySaver：状态存在当前 Python 进程的内存字典里\n# - 优点：无需数据库，调试方便\n# - 缺点：进程重启/多副本部署后历史全部丢失（见下文「为何不能上生产」）\ncheckpointer = InMemorySaver()\n\nagent = create_agent(\n    model=\"openai:gpt-4.1-mini\",\n    tools=[get_user_info],\n    checkpointer=checkpointer,  # 挂上短期记忆后端\n)\n\n# thread_id = 业务上的「会话 ID」\n# 同一 ID → 恢复该会话 checkpoint；新 ID → 空白会话\n# 切勿用 user_id 直接当 thread_id（一个用户常有多个并行会话）\nthread_config = {\"configurable\": {\"thread_id\": \"thread-001\"}}\n\n# 第 1 轮：用户自我介绍 → 写入 messages 并落盘到 checkpointer\nr1 = agent.invoke(\n    {\"messages\": [{\"role\": \"user\", \"content\": \"Hi! My name is Bob.\"}]},\n    thread_config,\n)\nprint(r1[\"messages\"][-1].content)\n\n# 第 2 轮：同一 thread_id → 自动带上第 1 轮历史，应能答出 Bob\nr2 = agent.invoke(\n    {\"messages\": [{\"role\": \"user\", \"content\": \"What is my name?\"}]},\n    thread_config,\n)\nprint(r2[\"messages\"][-1].content)\n"} />

      <H2>2. 生产环境：PostgresSaver</H2>
      <CodeBlock title="short_term_prod.py" code={"# -*- coding: utf-8 -*-\n\"\"\"短期记忆 · 生产示例（PostgresSaver）\n业务意图：线上多轮客服/助手，进程重启、水平扩容后会话仍可续聊。\n\"\"\"\n\n# pip install langgraph-checkpoint-postgres\nfrom langchain.agents import create_agent\nfrom langgraph.checkpoint.postgres import PostgresSaver\n\n# 生产库：与业务库可同实例不同 schema，或独立实例\nDB_URI = \"postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable\"\n\n# from_conn_string 管理连接生命周期；生产也可用连接池版 AsyncPostgresSaver\nwith PostgresSaver.from_conn_string(DB_URI) as checkpointer:\n    # 首次部署建表（checkpoint / writes 等）；上线流程纳入 migration\n    checkpointer.setup()\n\n    agent = create_agent(\n        model=\"openai:gpt-4.1-mini\",\n        tools=[],\n        checkpointer=checkpointer,  # 状态写入 PostgreSQL，跨进程可恢复\n    )\n\n    # thread_id 建议：服务端生成的 UUID，并与 tenant/user 做归属校验后再使用\n    config = {\"configurable\": {\"thread_id\": \"thread-001\"}}\n\n    # 轮次 1：偏好进入该 thread 的 messages checkpoint\n    agent.invoke(\n        {\"messages\": [{\"role\": \"user\", \"content\": \"记住我喜欢简洁回答\"}]},\n        config,\n    )\n    # 轮次 2：任意 API 实例只要连同一 DB + 同一 thread_id，即可续上上下文\n    agent.invoke(\n        {\"messages\": [{\"role\": \"user\", \"content\": \"用一句话介绍你自己\"}]},\n        config,\n    )\n"} />

      <H2>3. 扩展 State（自定义短期字段）</H2>
      <Text>
        默认 State 主要是 <Code>messages</Code>。会话内临时业务状态放 State；跨会话永久事实放 Store。
      </Text>
      <CodeBlock title="custom_state.py" code={"# -*- coding: utf-8 -*-\n\"\"\"扩展短期 State\n业务意图：本会话内还要暂存「购物车 / 审批单草稿」等非聊天字段，\n这些数据只在当前 thread 有效，不需要跨会话长期保存 → 放 AgentState，不要放 Store。\n\"\"\"\n\nfrom langchain.agents import create_agent, AgentState\nfrom langgraph.checkpoint.memory import InMemorySaver\n\nclass CustomAgentState(AgentState):\n    # 继承默认 messages 工作记忆\n    user_id: str          # 会话内冗余一份身份，便于节点读取（权威来源仍应是认证 Context）\n    preferences: dict     # 本会话临时偏好；若要跨会话永久记住，应改为 Store.put\n\nagent = create_agent(\n    model=\"openai:gpt-4.1-mini\",\n    tools=[],\n    state_schema=CustomAgentState,\n    checkpointer=InMemorySaver(),  # 演示用；生产换 PostgresSaver\n)\n\nresult = agent.invoke(\n    {\n        \"messages\": [{\"role\": \"user\", \"content\": \"Hello\"}],\n        \"user_id\": \"user_123\",\n        \"preferences\": {\"theme\": \"dark\"},\n    },\n    {\"configurable\": {\"thread_id\": \"1\"}},\n)\n"} />

      <Callout tone="warning" title="反模式">
        不要把 <Code>user_id</Code> 直接当 <Code>thread_id</Code>（并发会话互相污染）；
        不要每轮新建 <Code>thread_id</Code>（短期记忆无法恢复）；
        不要在生产用 InMemory 却指望多实例续聊。
      </Callout>
    </Stack>
  );
}

function LcContextMgmt() {
  return (
    <Stack gap={16}>
      <H2>长对话治理：裁剪 / 删除 / 摘要</H2>
      <Text>短期记忆打开后历史会撑爆上下文。按业务对「可丢失性」选择策略。</Text>
      <Table
        headers={["策略", "业务适合何时", "代价"]}
        rows={[
          ["Trim 裁剪", "早期多为闲聊，只关心最近几轮", "早期约束可能无提示丢失"],
          ["Delete 删除", "要抹掉敏感/错误回合", "不可逆；易破坏 tool 协议"],
          ["Summarize 摘要", "长工单/咨询，要点必须保留", "额外 LLM 成本与延迟"],
        ]}
        striped
      />

      <H3>A. before_model：裁剪</H3>
      <CodeBlock title="trim_before_model.py" code={"# -*- coding: utf-8 -*-\n\"\"\"上下文治理 · Trim（裁剪）\n业务意图：会话很长但早期内容价值低（闲聊），只需保住系统提示 + 最近几轮，\n用较低成本控制 token，可接受「早期细节丢失」。\n\"\"\"\n\nfrom typing import Any\nfrom langchain.agents import create_agent, AgentState\nfrom langchain.agents.middleware import before_model\nfrom langchain.messages import RemoveMessage\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph.message import REMOVE_ALL_MESSAGES\nfrom langgraph.runtime import Runtime\n\n@before_model\ndef trim_messages(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:\n    \"\"\"在调用 LLM 之前改写 messages。\n    返回 RemoveMessage + 新列表 → 永久改写 State（后续轮次也变短）。\n    若只想「本次调用少送一点、State 仍保留全文」，应改 model 入参而非 RemoveMessage。\n    \"\"\"\n    messages = state[\"messages\"]\n    if len(messages) <= 5:\n        return None  # 无需裁剪\n\n    first_msg = messages[0]  # 通常保留 system / 首条约束\n    # 尽量保留偶数条，降低切断 tool_call / tool_result 对的风险\n    recent = messages[-4:] if len(messages) % 2 == 0 else messages[-5:]\n    return {\n        \"messages\": [\n            RemoveMessage(id=REMOVE_ALL_MESSAGES),  # 清空旧列表\n            first_msg,\n            *recent,\n        ]\n    }\n\nagent = create_agent(\n    model=\"openai:gpt-4.1-mini\",\n    tools=[],\n    middleware=[trim_messages],\n    checkpointer=InMemorySaver(),\n)\n\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}\nagent.invoke({\"messages\": \"hi, my name is bob\"}, config)\nagent.invoke({\"messages\": \"write a short poem about cats\"}, config)\nagent.invoke({\"messages\": \"what's my name?\"}, config)\n"} />

      <H3>B. after_model：永久删除</H3>
      <CodeBlock title="delete_after_model.py" code={"# -*- coding: utf-8 -*-\n\"\"\"上下文治理 · Delete（删除）\n业务意图：明确去掉噪声或敏感回合（例如用户说了密码后又更正），\n需要从 State 抹掉，而不是仅本次不送给模型。\n\"\"\"\n\nfrom langchain.agents import create_agent, AgentState\nfrom langchain.agents.middleware import after_model\nfrom langchain.messages import RemoveMessage\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.runtime import Runtime\n\n@after_model\ndef delete_old_messages(state: AgentState, runtime: Runtime) -> dict | None:\n    \"\"\"模型调用之后清理。注意：删除后序列仍须满足厂商协议。\"\"\"\n    messages = state[\"messages\"]\n    if len(messages) > 6:\n        # 按 id 删除最早两条；不要拆开 tool_call 与对应 tool 结果\n        return {\"messages\": [RemoveMessage(id=m.id) for m in messages[:2]]}\n    return None\n\nagent = create_agent(\n    model=\"openai:gpt-4.1-mini\",\n    tools=[],\n    middleware=[delete_old_messages],\n    checkpointer=InMemorySaver(),\n)\n"} />
      <Callout tone="warning" title="删除时必须保持协议合法">
        assistant 的 tool_calls 后必须跟对应 tool 结果；部分模型要求历史以 user 开头。
      </Callout>

      <H3>C. SummarizationMiddleware：滚动摘要（长会话首选）</H3>
      <CodeBlock title="summarize_middleware.py" code={"# -*- coding: utf-8 -*-\n\"\"\"上下文治理 · Summarization（滚动摘要）【长会话生产首选】\n业务意图：工单/咨询持续数十轮，既要控制 token，又不能丢掉早期约束与结论。\n做法：旧消息压成摘要写回 State，保留最近原文。\n\"\"\"\n\nfrom langchain.agents import create_agent\nfrom langchain.agents.middleware import SummarizationMiddleware\nfrom langgraph.checkpoint.memory import InMemorySaver\n\ncheckpointer = InMemorySaver()\n\nagent = create_agent(\n    model=\"openai:gpt-4.1\",\n    tools=[],\n    middleware=[\n        SummarizationMiddleware(\n            model=\"openai:gpt-4.1-mini\",  # 可用更小模型做摘要以降本\n            trigger=(\"tokens\", 4000),     # 接近阈值触发；也可用消息条数触发\n            keep=(\"messages\", 20),        # 摘要后仍保留最近 20 条原文便于衔接\n        )\n    ],\n    checkpointer=checkpointer,\n)\n\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}\nagent.invoke({\"messages\": \"hi, my name is bob\"}, config)\nagent.invoke({\"messages\": \"write a short poem about cats\"}, config)\nagent.invoke({\"messages\": \"now do the same but for dogs\"}, config)\n# 即使早期原文已被摘要替换，姓名等关键事实通常仍留在 summary 中\nfinal = agent.invoke({\"messages\": \"what's my name?\"}, config)\nprint(final[\"messages\"][-1].content)\n"} />
    </Stack>
  );
}

function LcLongTerm() {
  return (
    <Stack gap={16}>
      <H2>长期记忆：Store + namespace + key</H2>
      <Text>
        长期记忆跨会话存活。键为 <Code>(namespace, key) → JSON</Code>。
        推荐 namespace <Code>(tenant_id, app_id, user_id, memory_type)</Code>。
      </Text>
      <H3>1. 挂载 Store</H3>
      <CodeBlock title="attach_store.py" code={"# -*- coding: utf-8 -*-\n\"\"\"长期记忆 · 挂载 Store\n业务意图：用户换了一个新会话（新 thread_id），仍要记得「我叫张三 / 偏好中文」。\n这不是 Checkpointer 的职责（Checkpointer 按 thread 隔离）。\n\"\"\"\n\nfrom langchain.agents import create_agent\nfrom langgraph.store.memory import InMemoryStore\n\n# 开发：InMemoryStore，重启即空\nstore = InMemoryStore()\nagent = create_agent(model=\"openai:gpt-4.1-mini\", tools=[], store=store)\n\n# 生产：PostgresStore（与 PostgresSaver 可共用 PG）\n# pip install langgraph-checkpoint-postgres\nfrom langgraph.store.postgres import PostgresStore\n\nDB_URI = \"postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable\"\nwith PostgresStore.from_conn_string(DB_URI) as store:\n    store.setup()  # 建长期记忆表 / 索引\n    agent = create_agent(model=\"openai:gpt-4.1-mini\", tools=[], store=store)\n"} />
      <H3>2. 应用层 CRUD</H3>
      <CodeBlock title="store_crud.py" code={"# -*- coding: utf-8 -*-\n\"\"\"长期记忆 · 应用层 CRUD + 语义检索\n业务意图：运营/后台任务写入用户画像；对话前按相似度召回相关偏好。\n\"\"\"\n\nfrom collections.abc import Sequence\nfrom langgraph.store.base import IndexConfig\nfrom langgraph.store.memory import InMemoryStore\n\ndef embed(texts: Sequence[str]) -> list[list[float]]:\n    \"\"\"生产中替换为真实 embedding 模型。\n    只应对需要语义召回的字段建索引，勿把密钥/原始证件号向量化。\n    \"\"\"\n    return [[float(len(t)), 1.0] for t in texts]\n\nstore = InMemoryStore(index=IndexConfig(embed=embed, dims=2))\n\n# namespace 建议：租户 + 用户 + 记忆类型 → 强隔离，防止串数据\nnamespace = (\"tenant-a\", \"user-42\", \"preferences\")\n\n# put：幂等 upsert；key 稳定则可重复写覆盖\nstore.put(\n    namespace,\n    \"profile\",\n    {\n        \"name\": \"Bob\",\n        \"language\": \"zh-CN\",\n        \"style\": \"concise\",\n        \"my-key\": \"my-value\",\n    },\n)\n\nitem = store.get(namespace, \"profile\")  # 精确读取\nprint(item.value)\n\n# search：可先 filter 再按向量相似度排序\nhits = store.search(\n    namespace,\n    filter={\"my-key\": \"my-value\"},\n    query=\"language preferences\",\n    limit=5,\n)\nfor h in hits:\n    print(h.key, h.value)\n"} />
      <H3>3. 工具内读取</H3>
      <CodeBlock title="tool_read_memory.py" code={"# -*- coding: utf-8 -*-\n\"\"\"长期记忆 · 工具内读取（对话中召回）\n业务意图：用户新开会话问「我的资料是什么」，Agent 通过工具读 Store，\n而不是依赖旧 thread 的 messages。\n\"\"\"\n\nfrom dataclasses import dataclass\nfrom langchain.agents import create_agent\nfrom langchain.tools import ToolRuntime, tool\nfrom langgraph.store.memory import InMemoryStore\n\n@dataclass\nclass Context:\n    # 认证层注入的用户身份；禁止让模型或前端随便填 namespace\n    user_id: str\n\nstore = InMemoryStore()\n# 预置一条长期记忆（也可由上次会话的 remember 工具写入）\nstore.put((\"users\",), \"user_123\", {\"name\": \"John Smith\", \"language\": \"English\"})\n\n@tool\ndef get_user_info(runtime: ToolRuntime[Context]) -> str:\n    \"\"\"从长期记忆读取当前用户资料。\"\"\"\n    assert runtime.store is not None\n    user_info = runtime.store.get((\"users\",), runtime.context.user_id)\n    return str(user_info.value) if user_info else \"Unknown user\"\n\nagent = create_agent(\n    model=\"openai:gpt-4.1-mini\",\n    tools=[get_user_info],\n    store=store,\n    context_schema=Context,\n)\n\nresult = agent.invoke(\n    {\"messages\": [{\"role\": \"user\", \"content\": \"look up user information\"}]},\n    context=Context(user_id=\"user_123\"),\n)\n"} />
      <H3>4. 工具内写入（Hot path）</H3>
      <CodeBlock title="tool_write_memory.py" code={"# -*- coding: utf-8 -*-\n\"\"\"长期记忆 · 工具内写入（Hot path）\n业务意图：用户明确说「请记住我的名字是…」→ 立刻写入 Store，\n下一会话无需再问。适合显式、低噪声、需立即生效的偏好。\n\"\"\"\n\nfrom dataclasses import dataclass\nfrom typing_extensions import TypedDict\nfrom langchain.agents import create_agent\nfrom langchain.tools import ToolRuntime, tool\nfrom langgraph.store.memory import InMemoryStore\n\nstore = InMemoryStore()\n\n@dataclass\nclass Context:\n    user_id: str\n\nclass UserInfo(TypedDict):\n    name: str\n    language: str\n\n@tool\ndef save_user_info(user_info: UserInfo, runtime: ToolRuntime[Context]) -> str:\n    \"\"\"把结构化用户信息写入长期记忆（跨 thread 可见）。\"\"\"\n    assert runtime.store is not None\n    # key 使用稳定的 user_id，保证重复「记住」是覆盖而非无限新增\n    runtime.store.put((\"users\",), runtime.context.user_id, dict(user_info))\n    return \"Successfully saved user info.\"\n\nagent = create_agent(\n    model=\"openai:gpt-4.1-mini\",\n    tools=[save_user_info],\n    store=store,\n    context_schema=Context,\n)\n\nagent.invoke(\n    {\"messages\": [{\"role\": \"user\", \"content\": \"My name is John Smith, I speak English\"}]},\n    context=Context(user_id=\"user_123\"),\n)\n\nprint(store.get((\"users\",), \"user_123\").value)\n"} />
      <Callout tone="danger" title="安全要点">
        namespace / user_id 必须来自已认证 Context；Store 的文件夹结构不等于授权边界。
      </Callout>
    </Stack>
  );
}

function LcWriteStrategy() {
  return (
    <Stack gap={16}>
      <H2>Hot path vs Background</H2>
      <Grid columns={2} gap={14}>
        <Card>
          <CardHeader>Hot path（对话内）</CardHeader>
          <CardBody>
            <Stack gap={7}>
              <Text>用户说「请记住…」时立刻 store.put。</Text>
              <Text>优点：立即可见、可确认。</Text>
              <Text>代价：增加延迟；易写入噪声。</Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Background（后台巩固）</CardHeader>
          <CardBody>
            <Stack gap={7}>
              <Text>会话结束后异步抽取、去重、合并冲突。</Text>
              <Text>优点：不挡主请求；质量更高。</Text>
              <Text>代价：下一轮才可见；需幂等重试。</Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
      <CodeBlock title="hybrid_memory_write.py" code={"# -*- coding: utf-8 -*-\n\"\"\"写入策略 · Hot path + Background 混合\n业务意图：\n- 用户说「请记住…」→ 立即写（Hot path）\n- 普通闲聊中的隐含偏好 → 会话结束后异步抽取合并（Background）\n\"\"\"\n\nimport hashlib\nimport json\n\nEXPLICIT_REMEMBER = {\"记住\", \"请记住\", \"remember\"}\n\ndef should_hot_path_write(user_text: str) -> bool:\n    \"\"\"显式记忆指令走热路径，保证当轮后续步骤就能读到。\"\"\"\n    return any(k in user_text.lower() for k in EXPLICIT_REMEMBER)\n\ndef memory_key(fact: dict) -> str:\n    \"\"\"稳定 key：支持幂等 upsert，避免后台任务重试导致重复事实。\"\"\"\n    raw = json.dumps(fact, sort_keys=True, ensure_ascii=False)\n    return hashlib.sha256(raw.encode()).hexdigest()[:24]\n\ndef hot_path_save(store, namespace, fact: dict) -> None:\n    store.put(\n        namespace,\n        memory_key(fact),\n        {**fact, \"source\": \"hot_path\", \"confidence\": 0.9},\n    )\n\ndef background_consolidate(store, namespace, transcript: list) -> None:\n    \"\"\"会话结束后由队列触发：抽取、去重、冲突解决。\n    优点：不挡用户；可跨多轮合成更高质量画像。\n    代价：下一会话才可见；必须幂等 + 可重试。\n    \"\"\"\n    extracted = extract_facts_with_llm(transcript)  # 业务自研抽取\n    for fact in extracted:\n        key = memory_key({\"type\": fact[\"type\"], \"subject\": fact[\"subject\"]})\n        old = store.get(namespace, key)\n        if old is None:\n            store.put(namespace, key, {**fact, \"source\": \"background\", \"version\": 1})\n        else:\n            store.put(namespace, key, merge_facts(old.value, fact))\n\n# ---- 主请求路径伪代码 ----\n# if should_hot_path_write(user_query):\n#     hot_path_save(store, (\"tenant\", user_id, \"facts\"), {\"text\": user_query})\n# else:\n#     enqueue_background_consolidate(thread_id, user_id)\n"} />
      <H3>Profile vs Collection</H3>
      <Table
        headers={["模式", "形态", "优点", "风险"]}
        rows={[
          ["Profile", "每用户一个大 JSON", "读取简单", "并发覆盖、字段丢失"],
          ["Collection", "每条事实一个文档", "易新增、适语义检索", "需去重/冲突检测"],
        ]}
        striped
      />
    </Stack>
  );
}

function LcProduction() {
  return (
    <Stack gap={16}>
      <H2>生产约束清单</H2>
      <Table
        headers={["主题", "最佳实践"]}
        rows={[
          ["隔离", "认证上下文决定 user_id；thread 与 user/tenant 绑定校验"],
          ["一致性", "稳定 key + upsert；Profile 带 version；后台任务幂等"],
          ["并发", "同 thread 优先 enqueue；同用户 Profile 归并串行化"],
          ["隐私", "最小化 PII；加密；TTL；删 thread 时同步清派生记忆"],
          ["召回", "先权限过滤再语义排序；限制 top-k 与注入 token"],
          ["可观测", "记录命中的 memory key、分数、注入 token、写入/删除"],
          ["评估", "写入准确率、召回质量、过时率、泄漏率、任务成功率"],
        ]}
        striped
      />
      <H2>删除会话时清理</H2>
      <CodeBlock title="delete_thread_and_memories.py" code={"# -*- coding: utf-8 -*-\n\"\"\"删除会话时的记忆清理\n业务意图：用户点击「删除对话 / 忘记我」时，短期 checkpoint 与长期派生记忆都要处理。\n\"\"\"\n\n# 1) 短期：删除该 thread 的全部 checkpoint（无法再续聊、无法 time travel）\ncheckpointer.delete_thread(thread_id)\n\n# 2) 长期：按用户 namespace 清理（示例）；若只要删会话、保留画像，则跳过此步\nnamespace = (\"tenant-a\", user_id, \"facts\")\nfor item in store.search(namespace, limit=1000):\n    store.delete(namespace, item.key)\n"} />
      <H2>旧 Memory API 迁移</H2>
      <Callout tone="warning" title="已弃用（0.3.1+，计划 2.0 移除）">
        ConversationBufferMemory 等位于 langchain-classic，新代码用 create_agent + checkpointer + store。
      </Callout>
      <CodeBlock title="migration_map.py" code={"# -*- coding: utf-8 -*-\n\"\"\"从旧 ConversationBufferMemory 迁移到 create_agent + checkpointer + store\n\"\"\"\n\n# 旧写法（0.3.1 起弃用，计划 2.0 移除）——不要再用\n# from langchain.memory import ConversationBufferMemory\n# memory = ConversationBufferMemory(return_messages=True)\n# chain = ConversationChain(llm=llm, memory=memory)\n\n# 新写法：短期用 checkpointer，跨会话用 store\nfrom langchain.agents import create_agent\nfrom langgraph.checkpoint.postgres import PostgresSaver\nfrom langgraph.store.postgres import PostgresStore\n\nwith PostgresSaver.from_conn_string(DB) as checkpointer, PostgresStore.from_conn_string(DB) as store:\n    checkpointer.setup()\n    store.setup()\n    agent = create_agent(\n        model=\"openai:gpt-4.1-mini\",\n        tools=[],  # 填入业务工具\n        checkpointer=checkpointer,\n        store=store,\n    )\n"} />
    </Stack>
  );
}

function LcEndToEnd() {
  return (
    <Stack gap={16}>
      <H2>完整示例：短期 + 长期 + 摘要 + 工具记忆</H2>
      <Text>把官方推荐拼成可运行骨架：Postgres 持久化、稳定 thread、认证 user、显式记忆工具、滚动摘要。</Text>
      <CodeBlock title="agent_memory_e2e.py" code={"# -*- coding: utf-8 -*-\n\"\"\"完整骨架：短期 Checkpointer + 长期 Store + 滚动摘要 + 显式记忆工具\n覆盖业务：\n1) 同一会话连续多轮（thread_id）\n2) 用户说「请记住」写入长期偏好\n3) 新会话仍能召回偏好\n4) 对话变长时自动摘要，防止撑爆上下文\n\"\"\"\n\nfrom dataclasses import dataclass\nfrom typing_extensions import TypedDict\n\nfrom langchain.agents import create_agent\nfrom langchain.agents.middleware import SummarizationMiddleware\nfrom langchain.tools import ToolRuntime, tool\nfrom langgraph.checkpoint.postgres import PostgresSaver\nfrom langgraph.store.postgres import PostgresStore\n\nDB_URI = \"postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable\"\n\n@dataclass\nclass Context:\n    tenant_id: str  # 来自网关/JWT，勿信客户端透传\n    user_id: str\n\nclass Preference(TypedDict):\n    key: str\n    value: str\n\ndef ns(ctx: Context, memory_type: str):\n    \"\"\"统一命名空间：租户 → 用户 → 记忆类型\"\"\"\n    return (ctx.tenant_id, ctx.user_id, memory_type)\n\n@tool\ndef remember_preference(pref: Preference, runtime: ToolRuntime[Context]) -> str:\n    \"\"\"用户明确要求记住偏好时调用（Hot path 长期记忆）。\"\"\"\n    assert runtime.store is not None\n    runtime.store.put(\n        ns(runtime.context, \"preferences\"),\n        pref[\"key\"],\n        {\"value\": pref[\"value\"], \"source\": \"explicit\"},\n    )\n    return \"Saved preference \" + pref[\"key\"] + \"=\" + pref[\"value\"]\n\n@tool\ndef recall_preferences(runtime: ToolRuntime[Context]) -> str:\n    \"\"\"召回当前用户的长期偏好（跨会话）。\"\"\"\n    assert runtime.store is not None\n    items = runtime.store.search(ns(runtime.context, \"preferences\"), limit=10)\n    if not items:\n        return \"No preferences saved.\"\n    return \"\\n\".join(str(i.key) + \": \" + str(i.value) for i in items)\n\nwith PostgresSaver.from_conn_string(DB_URI) as checkpointer, PostgresStore.from_conn_string(DB_URI) as store:\n    checkpointer.setup()\n    store.setup()\n\n    agent = create_agent(\n        model=\"openai:gpt-4.1\",\n        tools=[remember_preference, recall_preferences],\n        checkpointer=checkpointer,  # 短期\n        store=store,                # 长期\n        context_schema=Context,\n        middleware=[\n            SummarizationMiddleware(\n                model=\"openai:gpt-4.1-mini\",\n                trigger=(\"tokens\", 4000),\n                keep=(\"messages\", 20),\n            )\n        ],\n    )\n\n    ctx = Context(tenant_id=\"tenant-a\", user_id=\"u-42\")\n    # 会话 1\n    cfg = {\"configurable\": {\"thread_id\": \"u-42-session-1\"}}\n    agent.invoke(\n        {\"messages\": [{\"role\": \"user\", \"content\": \"请记住：我喜欢简洁中文回答\"}]},\n        cfg,\n        context=ctx,\n    )\n    agent.invoke(\n        {\"messages\": [{\"role\": \"user\", \"content\": \"我的偏好是什么？\"}]},\n        cfg,\n        context=ctx,\n    )\n\n    # 会话 2：新 thread，短期历史空白，但 Store 仍能召回偏好\n    cfg2 = {\"configurable\": {\"thread_id\": \"u-42-session-2\"}}\n    agent.invoke(\n        {\"messages\": [{\"role\": \"user\", \"content\": \"根据我的偏好自我介绍\"}]},\n        cfg2,\n        context=ctx,\n    )\n"} />
      <Callout tone="info" title="与当前 kb_agent 的对应关系">
        Dify TokenBuffer 近似「短期消息 + 丢弃式裁剪」。对齐本示例：先打通 conversation_id/user（短期），再引入用户级 Store（长期）。
      </Callout>
    </Stack>
  );
}


function Comparison() {
  return (
    <Stack gap={18}>
      <H2>逐项对比</H2>
      <Table
        headers={["维度", "当前项目", "LangChain / LangGraph 最佳实践", "差距判断"]}
        rows={[
          ["短期记忆载体", "KBA MySQL 展示历史 + Dify Conversation/Message", "AgentState + Checkpointer 状态快照", "Dify 侧可用；KBA 侧未稳定绑定"],
          ["会话标识", "KBA sessionId；Dify conversation_id（当前未落库）", "thread_id；checkpoint_id 可定位历史状态", "产品路径断裂在 KBA 映射层"],
          ["用户作用域", "KBA 每轮时间戳 user；Dify 按 EndUser 校验", "认证上下文注入 user_id + namespace", "当前会破坏会话归属"],
          ["Agent 工具轨迹", "MessageAgentThought 重建 tool call/result", "messages state 原生保存结构化工具消息", "能力接近，但依赖同一 conversation"],
          ["上下文裁剪", "最多 500 条，超 token 丢最旧消息", "trim/delete/summarize 中间件", "项目缺摘要，且策略不统一"],
          ["长期记忆", "无跨 conversation 用户级 Store", "Store + namespace/key + semantic search", "核心缺口"],
          ["会话隔离", "Dify 较完整；KBA 多数接口缺校验", "tenant/app/user + 资源级授权", "KBA 为 P0 安全风险"],
          ["写入策略", "双写展示表与 Dify 原始消息", "Hot path 与后台巩固组合", "缺幂等映射与记忆抽取"],
        ]}
        rowTone={["danger", "danger", "danger", "warning", "warning", "danger", "danger", "warning"]}
        stickyHeader
        striped
      />

      <H2>具体风险</H2>
      <Grid columns={2} gap={14}>
        <Stack gap={10}>
          <Callout tone="danger" title="P0：KBA 未打通 Dify 多轮记忆">
            <Code>difyConversationId</Code> 不落库，且每轮用时间戳生成新 user。结果是前端有历史，模型几乎只看当前轮。
          </Callout>
          <Callout tone="danger" title="P0：KBA 会话隔离不足">
            普通会话列表、消息读取、发送、删除多数缺少 userId/tenantId 条件；助手路径也仅删除时有部分校验。
          </Callout>
          <Callout tone="danger" title="长期个性化实际上不存在">
            即使修好 KBA 会话绑定，用户开启新 conversation 后历史偏好也不会被主动召回。知识库 RAG 不能替代用户级长期记忆。
          </Callout>
        </Stack>
        <Stack gap={10}>
          <Callout tone="warning" title="丢弃式裁剪会遗忘早期约束">
            超预算后直接删除最旧消息，姓名、偏好、承诺和早期任务条件可能无提示地消失。
          </Callout>
          <Callout tone="warning" title="工具消息协议可能被破坏">
            TokenBufferMemory 按单条 PromptMessage 删除；若边界落在 assistant tool call 与 tool result 之间，部分模型会拒绝请求。
          </Callout>
          <Callout tone="warning" title="双份消息一致性弱">
            KBA 先写用户消息再调 Dify；失败后可能留下孤立用户消息，且没有失败状态、幂等键或与 Dify message_id 的映射。
          </Callout>
        </Stack>
      </Grid>

      <H2>不建议的做法</H2>
      <Text>不要把整个 Conversation 原文复制到向量库并称为长期记忆；这会导致重复、隐私扩散和低质量召回。</Text>
      <Text>不要让 LLM 自行决定 tenant_id、user_id 或 namespace；作用域必须来自已认证运行时上下文。</Text>
      <Text>不要仅按消息条数裁剪；应在模型调用前使用真实 token 预算，并保持 tool call/result 与完整轮次原子性。</Text>
      <Text>不要在没有 provenance、TTL、删除和冲突策略时上线用户画像记忆。</Text>
    </Stack>
  );
}

function Roadmap() {
  return (
    <Stack gap={18}>
      <Callout tone="info" title="建议方向">
        先修复 KBA 代理层的 conversation_id 持久化与稳定 user 绑定，否则 Dify/LangChain 侧任何记忆增强都无法在产品路径生效。
        之后再保留现有 Dify 消息与 Agent 逻辑，借鉴 Checkpointer/Store 的职责分离补齐统一短期记忆策略和用户级长期记忆。
      </Callout>

      <H2>分阶段改进</H2>
      <Table
        headers={["优先级", "工作项", "验收标准"]}
        rows={[
          ["P0", "持久化 difyConversationId", "Chat/Assistant 会话表有字段；更新方法真正写库；下一轮请求携带同一 ID"],
          ["P0", "稳定 Dify user 身份", "使用登录用户或稳定业务 user key；禁止每轮时间戳；归属校验通过"],
          ["P0", "补齐 KBA 会话隔离", "列表、详情、消息、发送、删除均强制 userId + tenantId；校验 app/assistant 归属"],
          ["P1", "统一短期记忆预算", "Agent、Chat、Workflow 共用 token budget；完整保留 user/assistant/tool 原子组"],
          ["P1", "加入滚动摘要", "达到阈值后生成结构化摘要，保留近期原文；摘要带版本与覆盖区间"],
          ["P2", "建立长期记忆 Store", "namespace=(tenant, app, user, type)；支持过滤、top-k 与语义检索"],
          ["P2", "记忆抽取与合并", "显式记忆即时写；其余后台抽取；支持幂等、去重、冲突和 provenance"],
          ["P3", "专项评估与观测", "隔离/泄漏测试、写入准确率、召回质量、过期率、成本和延迟基线"],
        ]}
        rowTone={["danger", "danger", "danger", "warning", "warning", "info", "info", "neutral"]}
        striped
      />

      <H2>推荐目标结构</H2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 10, alignItems: "stretch" }}>
        <Card>
          <CardHeader>请求上下文</CardHeader>
          <CardBody>
            <Text size="small">认证 tenant/app/user、conversation_id、本轮输入和权限。</Text>
          </CardBody>
        </Card>
        <Text tone="tertiary" style={{ alignSelf: "center" }}>→</Text>
        <Card>
          <CardHeader>Context Builder</CardHeader>
          <CardBody>
            <Text size="small">系统提示 + 近期原文 + 滚动摘要 + 相关长期记忆；统一 token 预算。</Text>
          </CardBody>
        </Card>
        <Text tone="tertiary" style={{ alignSelf: "center" }}>→</Text>
        <Card>
          <CardHeader>Agent 执行</CardHeader>
          <CardBody>
            <Text size="small">消息、工具轨迹继续写现有业务表；关键步骤可增加 checkpoint。</Text>
          </CardBody>
        </Card>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <CardHeader>Short-term Repository</CardHeader>
          <CardBody>
            <Text size="small">conversation/thread 范围：原始消息、工具消息、摘要、会话变量。</Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Long-term Store</CardHeader>
          <CardBody>
            <Text size="small">user 范围：profile、facts、episodes、procedures；支持过滤与语义检索。</Text>
          </CardBody>
        </Card>
      </div>

      <H2>长期记忆最小数据模型</H2>
      <Table
        headers={["字段", "用途"]}
        rows={[
          ["namespace", "tenant_id / app_id / user_id / memory_type，形成强隔离边界"],
          ["key", "稳定业务键或内容哈希，支持幂等 upsert"],
          ["value", "结构化事实、偏好、事件或规则，不直接保存无界原始对话"],
          ["provenance", "来源 conversation_id、message_id、工具或人工确认"],
          ["confidence", "抽取可信度；低置信度记忆不自动影响高风险任务"],
          ["valid_from / expires_at", "时效控制与 TTL"],
          ["version", "乐观并发、冲突处理和审计"],
          ["embedding", "仅对允许语义检索的字段建立索引"],
        ]}
        striped
      />
    </Stack>
  );
}

function Evidence() {
  return (
    <Stack gap={18}>
      <H2>项目证据索引</H2>
      <Table
        headers={["主题", "文件", "关键行"]}
        rows={[
          ["KBA difyConversationId 不落库", <FileButton path={files.chatSession} line={31} />, "31–33"],
          ["KBA 每轮新 user", <FileButton path={files.chatService} line={95} />, "95"],
          ["KBA 更新只改内存对象", <FileButton path={files.chatService} line={198} />, "198–204"],
          ["助手更新方法为空", <FileButton path={files.assistantService} line={280} />, "280–282"],
          ["Dify 请求不带历史消息", <FileButton path={files.difyClient} line={37} />, "37–50"],
          ["TokenBufferMemory 核心读取/裁剪", <FileButton path={files.memory} line={117} />, "117–243"],
          ["Agent Chat 创建 memory", <FileButton path={files.appRunner} line={58} />, "58–79, 169–225"],
          ["Agent 工具轨迹持久化与重放", <FileButton path={files.baseRunner} line={285} />, "285–413, 415–508"],
          ["Agent 历史 token 裁剪", <FileButton path={files.historyTransform} line={33} />, "33–84"],
          ["会话与空 Message 创建", <FileButton path={files.messageGenerator} line={163} />, "163–244"],
          ["最终答案与 usage 回写", <FileButton path={files.savePipeline} line={375} />, "375–423"],
          ["分支线程提取", <FileButton path={files.threadExtractor} line={7} />, "7–25"],
          ["Conversation / Message 数据模型", <FileButton path={files.models} line={978} />, "978–1035, 1317–1367"],
          ["Workflow memory 注入", <FileButton path={files.llmNode} line={787} />, "787–848, 1308–1350"],
          ["Workflow 会话变量持久化", <FileButton path={files.variableLayer} line={22} />, "22–57"],
        ]}
        striped
      />

      <H2>LangChain 官方资料</H2>
      <Stack gap={8}>
        {sourceLinks.map(([label, href]) => (
          <div key={href}>
            <Row gap={10} align="center">
              <Pill size="sm">官方</Pill>
              <Link href={href}>{label}</Link>
            </Row>
          </div>
        ))}
      </Stack>

      <Divider />
      <Text tone="tertiary" size="small">
        评审时间：2026-07-19。项目结论基于当前工作区代码静态分析；LangChain 结论以当日官方文档与官方 API Reference 为准。
      </Text>
    </Stack>
  );
}

export default function AgentMemoryArchitectureReview() {
  const theme = useHostTheme();
  const [tab, setTab] = useCanvasState("active-tab", "overview");
  const tabs = [
    ["overview", "结论"],
    ["flow", "项目实现"],
    ["langchain", "LangChain 实践"],
    ["comparison", "对比与风险"],
    ["roadmap", "改进路线"],
    ["evidence", "证据"],
  ];

  return (
    <Stack gap={18} style={{ padding: 24, maxWidth: 1180, margin: "0 auto", color: theme.text.primary }}>
      <Stack gap={5}>
        <H1>Agent 记忆系统架构评审</H1>
        <Text tone="secondary">kb_agent / Dify 实现 · LangChain 最佳实践 · 业务选型流程与注释示例</Text>
      </Stack>
      <Row gap={8} wrap>
        {tabs.map(([id, label]) => (
          <span key={id}>
            <Pill active={tab === id} onClick={() => setTab(id)}>
              {label}
            </Pill>
          </span>
        ))}
      </Row>
      <Divider />
      {tab === "overview" && <Overview />}
      {tab === "flow" && <ProjectFlow />}
      {tab === "langchain" && <LangChainPractices />}
      {tab === "comparison" && <Comparison />}
      {tab === "roadmap" && <Roadmap />}
      {tab === "evidence" && <Evidence />}
    </Stack>
  );
}
