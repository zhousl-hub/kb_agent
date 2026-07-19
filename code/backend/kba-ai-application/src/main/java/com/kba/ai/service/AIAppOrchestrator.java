package com.kba.ai.service;

import reactor.core.publisher.Flux;

/**
 * AI应用编排器接口
 *
 * @author kba
 */
public interface AIAppOrchestrator {

    Flux<String> streamChat(Long appId, Long sessionId, String message);

    String chat(Long appId, Long sessionId, String message);

    void createDifyApp(Long appId);

    void updateDifyApp(Long appId);

    void deleteDifyApp(Long appId);
}
