package com.kba.ai.service;

import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

/**
 * 对话服务接口
 *
 * @author kba
 */
public interface ChatService {

    Map<String, Object> createSession(Long appId, String title);

    List<Map<String, Object>> getSessions(Long appId, int pageNum, int pageSize);

    List<Map<String, Object>> getMessages(Long sessionId, int pageNum, int pageSize);

    Flux<String> sendMessage(Long appId, Long sessionId, String content, boolean stream);

    void deleteSession(Long sessionId);
}
