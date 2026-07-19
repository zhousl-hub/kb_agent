package com.kba.ai.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kba.ai.entity.ChatMessage;
import com.kba.ai.entity.ChatSession;
import com.kba.ai.mapper.ChatMessageMapper;
import com.kba.ai.mapper.ChatSessionMapper;
import com.kba.ai.client.DifyWebClient;
import com.kba.ai.service.ChatService;
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
 * 对话服务实现
 *
 * @author kba
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatSessionMapper chatSessionMapper;
    private final ChatMessageMapper chatMessageMapper;
    private final DifyWebClient difyWebClient;
    private final ObjectMapper objectMapper;

    @Override
    public Map<String, Object> createSession(Long appId, String title) {
        ChatSession session = new ChatSession();
        session.setAppId(appId);
        session.setUserId(StpUtil.getLoginIdAsLong());
        session.setTenantId(1L);
        session.setTitle(title != null ? title : "新对话");
        session.setStatus(1);
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        chatSessionMapper.insert(session);
        return toSessionMap(session);
    }

    @Override
    public List<Map<String, Object>> getSessions(Long appId, int pageNum, int pageSize) {
        LambdaQueryWrapper<ChatSession> wrapper = new LambdaQueryWrapper<ChatSession>()
                .orderByDesc(ChatSession::getCreatedAt);
        if (appId != null) {
            wrapper.eq(ChatSession::getAppId, appId);
        }
        List<ChatSession> sessions = chatSessionMapper.selectList(wrapper);
        return sessions.stream()
            .skip((long) (pageNum - 1) * pageSize)
            .limit(pageSize)
            .map(this::toSessionMap)
            .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getMessages(Long sessionId, int pageNum, int pageSize) {
        List<ChatMessage> messages = findMessagesBySessionId(sessionId);
        return messages.stream()
            .skip((long) (pageNum - 1) * pageSize)
            .limit(pageSize)
            .map(this::toMessageMap)
            .collect(Collectors.toList());
    }

    @Override
    public Flux<String> sendMessage(Long appId, Long sessionId, String content, boolean stream) {
        ChatSession session = chatSessionMapper.selectById(sessionId);
        if (session == null) {
            throw new BusinessException(404, "会话不存在");
        }

        ChatMessage userMessage = new ChatMessage();
        userMessage.setSessionId(sessionId);
        userMessage.setTenantId(session.getTenantId() != null ? session.getTenantId() : 1L);
        userMessage.setRole("USER");
        userMessage.setContent(content);
        userMessage.setCreatedAt(LocalDateTime.now());
        chatMessageMapper.insert(userMessage);

        String user = "user-" + System.currentTimeMillis();

        if (stream) {
            return sendStreamMessage(session, content, user);
        } else {
            return sendBlockingMessage(session, content, user);
        }
    }

    private Flux<String> sendStreamMessage(ChatSession session, String content, String user) {
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
                    ChatMessage assistantMessage = new ChatMessage();
                    assistantMessage.setSessionId(session.getId());
                    assistantMessage.setTenantId(session.getTenantId() != null ? session.getTenantId() : 1L);
                    assistantMessage.setRole("ASSISTANT");
                    assistantMessage.setContent(fullAnswer);
                    assistantMessage.setCreatedAt(LocalDateTime.now());
                    chatMessageMapper.insert(assistantMessage);
                }
            });
    }

    private Flux<String> sendBlockingMessage(ChatSession session, String content, String user) {
        return difyWebClient.chat(session.getDifyConversationId(), content, user)
            .flatMapMany(response -> {
                String answer = (String) response.get("answer");
                String conversationId = (String) response.get("conversation_id");

                if (conversationId != null && !conversationId.equals(session.getDifyConversationId())) {
                    updateSessionDifyConversationId(session.getId(), conversationId);
                }

                if (answer != null && !answer.isEmpty()) {
                    ChatMessage assistantMessage = new ChatMessage();
                    assistantMessage.setSessionId(session.getId());
                    assistantMessage.setTenantId(session.getTenantId() != null ? session.getTenantId() : 1L);
                    assistantMessage.setRole("ASSISTANT");
                    assistantMessage.setContent(answer);
                    assistantMessage.setCreatedAt(LocalDateTime.now());
                    chatMessageMapper.insert(assistantMessage);
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
        deleteMessagesBySessionId(sessionId);
        chatSessionMapper.deleteById(sessionId);
    }

    private List<ChatMessage> findMessagesBySessionId(Long sessionId) {
        return chatMessageMapper.selectList(
            new LambdaQueryWrapper<ChatMessage>()
                .eq(ChatMessage::getSessionId, sessionId)
                .orderByAsc(ChatMessage::getCreatedAt));
    }

    private void deleteMessagesBySessionId(Long sessionId) {
        chatMessageMapper.delete(
            new LambdaQueryWrapper<ChatMessage>()
                .eq(ChatMessage::getSessionId, sessionId));
    }

    private void updateSessionDifyConversationId(Long id, String difyConversationId) {
        // Dify 会话 ID 暂存内存，后续可写入 context 字段
        ChatSession session = chatSessionMapper.selectById(id);
        if (session != null) {
            session.setDifyConversationId(difyConversationId);
        }
    }

    private Map<String, Object> toSessionMap(ChatSession session) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", session.getId());
        map.put("appId", session.getAppId());
        map.put("title", session.getTitle());
        map.put("createdAt", session.getCreatedAt());
        map.put("updatedAt", session.getUpdatedAt());
        map.put("messageCount", countMessagesBySessionId(session.getId()));
        return map;
    }

    private long countMessagesBySessionId(Long sessionId) {
        return chatMessageMapper.selectCount(
            new LambdaQueryWrapper<ChatMessage>()
                .eq(ChatMessage::getSessionId, sessionId));
    }

    private Map<String, Object> toMessageMap(ChatMessage message) {
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
