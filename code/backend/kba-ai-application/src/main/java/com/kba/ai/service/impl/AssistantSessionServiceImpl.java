package com.kba.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import cn.dev33.satoken.stp.StpUtil;
import com.kba.ai.entity.Assistant;
import com.kba.ai.entity.AssistantMessage;
import com.kba.ai.entity.AssistantSession;
import com.kba.ai.mapper.AssistantMapper;
import com.kba.ai.mapper.AssistantMessageMapper;
import com.kba.ai.mapper.AssistantSessionMapper;
import com.kba.ai.client.DifyWebClient;
import com.kba.ai.service.AssistantSessionService;
import com.kba.common.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

/**
 * 助手会话服务实现
 *
 * @author kba
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AssistantSessionServiceImpl implements AssistantSessionService {

    private final AssistantSessionMapper assistantSessionMapper;
    private final AssistantMessageMapper assistantMessageMapper;
    private final AssistantMapper assistantMapper;
    private final DifyWebClient difyWebClient;
    private final ObjectMapper objectMapper;

    @Override
    public Map<String, Object> createSession(Long assistantId, String title) {
        Assistant assistant = assistantMapper.selectById(assistantId);
        if (assistant == null) {
            throw new BusinessException(404, "助手不存在");
        }

        AssistantSession session = new AssistantSession();
        session.setAssistantId(assistantId);
        session.setUserId(StpUtil.getLoginIdAsLong());
        session.setTenantId(1L);
        session.setTitle(title != null ? title : "新对话");
        session.setStatus(1);
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        assistantSessionMapper.insert(session);
        return toSessionMap(session);
    }

    @Override
    public List<Map<String, Object>> getSessionsByAssistantId(Long assistantId, int pageNum, int pageSize) {
        List<AssistantSession> sessions = assistantSessionMapper.selectList(
            new LambdaQueryWrapper<AssistantSession>()
                .eq(AssistantSession::getAssistantId, assistantId)
                .orderByDesc(AssistantSession::getCreatedAt));
        return sessions.stream()
            .skip((long) (pageNum - 1) * pageSize)
            .limit(pageSize)
            .map(this::toSessionMap)
            .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getAllSessions(int pageNum, int pageSize, String search) {
        Long userId = StpUtil.getLoginIdAsLong();
        List<AssistantSession> sessions = assistantSessionMapper.selectList(
            new LambdaQueryWrapper<AssistantSession>()
                .eq(AssistantSession::getUserId, userId)
                .orderByDesc(AssistantSession::getCreatedAt));
        return sessions.stream()
            .filter(session -> search == null || search.isBlank()
                || (session.getTitle() != null && session.getTitle().contains(search)))
            .skip((long) (pageNum - 1) * pageSize)
            .limit(pageSize)
            .map(this::toHistoryMap)
            .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getSessionById(Long id) {
        AssistantSession session = assistantSessionMapper.selectById(id);
        if (session == null) {
            throw new BusinessException(404, "会话不存在");
        }
        return toSessionMap(session);
    }

    @Override
    public List<Map<String, Object>> getMessages(Long sessionId, int pageNum, int pageSize) {
        List<AssistantMessage> messages = findMessagesBySessionId(sessionId);
        return messages.stream()
            .skip((long) (pageNum - 1) * pageSize)
            .limit(pageSize)
            .map(this::toMessageMap)
            .collect(Collectors.toList());
    }

    @Override
    public Flux<String> sendMessage(Long assistantId, Long sessionId, String content, boolean stream) {
        Assistant assistant = assistantMapper.selectById(assistantId);
        if (assistant == null) {
            throw new BusinessException(404, "助手不存在");
        }

        AssistantSession session = assistantSessionMapper.selectById(sessionId);
        if (session == null) {
            throw new BusinessException(404, "会话不存在");
        }

        AssistantMessage userMessage = new AssistantMessage();
        userMessage.setSessionId(sessionId);
        userMessage.setTenantId(session.getTenantId() != null ? session.getTenantId() : 1L);
        userMessage.setRole("USER");
        userMessage.setContent(content);
        userMessage.setCreatedAt(LocalDateTime.now());
        assistantMessageMapper.insert(userMessage);

        String user = "user-" + System.currentTimeMillis();

        if (stream) {
            return sendStreamMessage(session, content, user);
        } else {
            return sendBlockingMessage(session, content, user);
        }
    }

    private Flux<String> sendStreamMessage(AssistantSession session, String content, String user) {
        AtomicReference<StringBuilder> answerBuilder = new AtomicReference<>(new StringBuilder());
        AtomicReference<String> conversationId = new AtomicReference<>(session.getDifyConversationId());

        return difyWebClient.chatStream(session.getDifyConversationId(), content, user)
            .doOnNext(chunk -> {
                try {
                    JsonNode node = objectMapper.readTree(chunk);
                    if (node.has("conversation_id")) {
                        String newConversationId = node.get("conversation_id").asText();
                        if (conversationId.get() == null || !conversationId.get().equals(newConversationId)) {
                            conversationId.set(newConversationId);
                            updateSessionDifyConversationId(session.getId(), newConversationId);
                        }
                    }
                    if (node.has("answer")) {
                        answerBuilder.get().append(node.get("answer").asText());
                    } else if (node.has("event")) {
                        String event = node.get("event").asText();
                        if ("message".equals(event) && node.has("data")) {
                            JsonNode data = node.get("data");
                            if (data.has("content")) {
                                answerBuilder.get().append(data.get("content").asText());
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("Parse stream chunk error: {}", e.getMessage());
                }
            })
            .doOnComplete(() -> {
                String fullAnswer = answerBuilder.get().toString();
                if (!fullAnswer.isEmpty()) {
                    AssistantMessage assistantMessage = new AssistantMessage();
                    assistantMessage.setSessionId(session.getId());
                    assistantMessage.setTenantId(session.getTenantId() != null ? session.getTenantId() : 1L);
                    assistantMessage.setRole("ASSISTANT");
                    assistantMessage.setContent(fullAnswer);
                    assistantMessage.setCreatedAt(LocalDateTime.now());
                    assistantMessageMapper.insert(assistantMessage);
                }
            });
    }

    private Flux<String> sendBlockingMessage(AssistantSession session, String content, String user) {
        return difyWebClient.chat(session.getDifyConversationId(), content, user)
            .flatMapMany(response -> {
                String answer = (String) response.get("answer");
                String conversationId = (String) response.get("conversation_id");

                if (conversationId != null && !conversationId.equals(session.getDifyConversationId())) {
                    updateSessionDifyConversationId(session.getId(), conversationId);
                }

                if (answer != null && !answer.isEmpty()) {
                    AssistantMessage assistantMessage = new AssistantMessage();
                    assistantMessage.setSessionId(session.getId());
                    assistantMessage.setTenantId(session.getTenantId() != null ? session.getTenantId() : 1L);
                    assistantMessage.setRole("ASSISTANT");
                    assistantMessage.setContent(answer);
                    assistantMessage.setCreatedAt(LocalDateTime.now());
                    assistantMessageMapper.insert(assistantMessage);
                }

                try {
                    Map<String, Object> result = new HashMap<>();
                    result.put("event", "message_end");
                    result.put("answer", answer);
                    return Flux.just(objectMapper.writeValueAsString(result));
                } catch (Exception e) {
                    return Flux.empty();
                }
            });
    }

    @Override
    public void deleteSession(Long sessionId) {
        Long userId = StpUtil.getLoginIdAsLong();
        AssistantSession session = assistantSessionMapper.selectById(sessionId);
        if (session == null) {
            throw new BusinessException(404, "会话不存在");
        }
        if (session.getUserId() != null && !userId.equals(session.getUserId())) {
            throw new BusinessException(403, "无权删除该会话");
        }
        deleteMessagesBySessionId(sessionId);
        assistantSessionMapper.deleteById(sessionId);
    }

    @Override
    public void clearAllForCurrentUser() {
        Long userId = StpUtil.getLoginIdAsLong();
        List<AssistantSession> sessions = assistantSessionMapper.selectList(
            new LambdaQueryWrapper<AssistantSession>()
                .eq(AssistantSession::getUserId, userId)
                .orderByDesc(AssistantSession::getCreatedAt));
        for (AssistantSession session : sessions) {
            deleteMessagesBySessionId(session.getId());
            assistantSessionMapper.deleteById(session.getId());
        }
    }

    private Map<String, Object> toHistoryMap(AssistantSession session) {
        Map<String, Object> map = toSessionMap(session);
        map.put("preview", resolvePreview(session.getId()));
        map.put("knowledgeBaseName", resolveAssistantName(session.getAssistantId()));
        return map;
    }

    private String resolvePreview(Long sessionId) {
        List<AssistantMessage> messages = findMessagesBySessionId(sessionId);
        if (messages.isEmpty()) {
            return "";
        }
        AssistantMessage last = messages.get(messages.size() - 1);
        String content = last.getContent() != null ? last.getContent() : "";
        return content.length() > 120 ? content.substring(0, 120) + "..." : content;
    }

    private String resolveAssistantName(Long assistantId) {
        if (assistantId == null) {
            return "";
        }
        Assistant assistant = assistantMapper.selectById(assistantId);
        return assistant != null && assistant.getName() != null ? assistant.getName() : "";
    }

    private List<AssistantMessage> findMessagesBySessionId(Long sessionId) {
        return assistantMessageMapper.selectList(
            new LambdaQueryWrapper<AssistantMessage>()
                .eq(AssistantMessage::getSessionId, sessionId)
                .orderByAsc(AssistantMessage::getCreatedAt));
    }

    private void deleteMessagesBySessionId(Long sessionId) {
        assistantMessageMapper.delete(
            new LambdaQueryWrapper<AssistantMessage>()
                .eq(AssistantMessage::getSessionId, sessionId));
    }

    private void updateSessionDifyConversationId(Long id, String difyConversationId) {
        // Dify 会话 ID 暂不入库，保留原有行为
    }

    private Map<String, Object> toSessionMap(AssistantSession session) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", String.valueOf(session.getId()));
        map.put("assistantId", session.getAssistantId());
        map.put("title", session.getTitle());
        map.put("createdAt", session.getCreatedAt());
        map.put("updatedAt", session.getUpdatedAt());
        map.put("messageCount", countMessagesBySessionId(session.getId()));
        return map;
    }

    private int countMessagesBySessionId(Long sessionId) {
        return Math.toIntExact(assistantMessageMapper.selectCount(
            new LambdaQueryWrapper<AssistantMessage>()
                .eq(AssistantMessage::getSessionId, sessionId)));
    }

    private Map<String, Object> toMessageMap(AssistantMessage message) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", message.getId());
        map.put("sessionId", message.getSessionId());
        map.put("role", message.getRole());
        map.put("content", message.getContent());
        map.put("tokenCount", message.getTokenCount());
        map.put("createdAt", message.getCreatedAt());
        return map;
    }
}
