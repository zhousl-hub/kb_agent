package com.kba.ai.service;

import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

/**
 * 助手会话服务接口
 *
 * @author kba
 */
public interface AssistantSessionService {

    Map<String, Object> createSession(Long assistantId, String title);

    List<Map<String, Object>> getSessionsByAssistantId(Long assistantId, int pageNum, int pageSize);

    List<Map<String, Object>> getAllSessions(int pageNum, int pageSize, String search);

    Map<String, Object> getSessionById(Long id);

    List<Map<String, Object>> getMessages(Long sessionId, int pageNum, int pageSize);

    Flux<String> sendMessage(Long assistantId, Long sessionId, String content, boolean stream);

    void deleteSession(Long sessionId);

    void clearAllForCurrentUser();
}
