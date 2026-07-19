package com.kba.ai.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kba.ai.entity.AIApp;
import com.kba.ai.entity.LLMModel;
import com.kba.ai.mapper.AIAppMapper;
import com.kba.ai.mapper.LLMModelMapper;
import com.kba.ai.service.AIAppOrchestrator;
import com.kba.ai.client.DifyWebClient;
import com.kba.common.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIAppOrchestratorImpl implements AIAppOrchestrator {

    private final AIAppMapper aiAppMapper;
    private final LLMModelMapper llmModelMapper;
    private final DifyWebClient difyWebClient;
    private final ObjectMapper objectMapper;

    @Override
    public Flux<String> streamChat(Long appId, Long sessionId, String message) {
        AIApp app = aiAppMapper.selectById(appId);
        if (app == null) {
            throw new BusinessException(404, "应用不存在");
        }

        if (!"published".equals(app.getStatus())) {
            return Flux.just(createErrorEvent("应用未发布，无法进行对话"));
        }

        String user = buildUserIdentifier(sessionId);
        String conversationId = null;

        return difyWebClient.chatStream(conversationId, message, user)
            .doOnNext(chunk -> log.debug("Received chunk for app {}: {}", appId, chunk))
            .doOnError(error -> log.error("Stream chat error for app {}: {}", appId, error.getMessage()));
    }

    @Override
    public String chat(Long appId, Long sessionId, String message) {
        AIApp app = aiAppMapper.selectById(appId);
        if (app == null) {
            throw new BusinessException(404, "应用不存在");
        }

        if (!"published".equals(app.getStatus())) {
            throw new BusinessException(400, "应用未发布，无法进行对话");
        }

        String user = buildUserIdentifier(sessionId);

        try {
            Map<String, Object> response = difyWebClient.chat(null, message, user).block();
            if (response != null && response.containsKey("answer")) {
                return (String) response.get("answer");
            }
            return "";
        } catch (Exception e) {
            log.error("Chat error for app {}: {}", appId, e.getMessage());
            throw new BusinessException(500, "对话失败: " + e.getMessage());
        }
    }

    @Override
    public void createDifyApp(Long appId) {
        AIApp app = aiAppMapper.selectById(appId);
        if (app == null) {
            throw new BusinessException(404, "应用不存在");
        }

        log.info("Creating Dify app for appId: {}, name: {}", appId, app.getName());

        if (app.getModelId() != null) {
            LLMModel model = llmModelMapper.selectById(app.getModelId());
            if (model != null) {
                log.info("Using model: {} ({})", model.getName(), model.getModelName());
            }
        }
    }

    @Override
    public void updateDifyApp(Long appId) {
        AIApp app = aiAppMapper.selectById(appId);
        if (app == null) {
            throw new BusinessException(404, "应用不存在");
        }

        log.info("Updating Dify app for appId: {}, name: {}", appId, app.getName());
    }

    @Override
    public void deleteDifyApp(Long appId) {
        AIApp app = aiAppMapper.selectById(appId);
        if (app == null) {
            throw new BusinessException(404, "应用不存在");
        }

        log.info("Deleting Dify app for appId: {}, difyAppId: {}", appId, app.getDifyAppId());
    }

    private String buildUserIdentifier(Long sessionId) {
        return "session-" + sessionId;
    }

    private String createErrorEvent(String message) {
        try {
            Map<String, Object> errorEvent = new HashMap<>();
            errorEvent.put("event", "error");
            errorEvent.put("message", message);
            return objectMapper.writeValueAsString(errorEvent);
        } catch (Exception e) {
            return "{\"event\":\"error\",\"message\":\"" + message + "\"}";
        }
    }
}
