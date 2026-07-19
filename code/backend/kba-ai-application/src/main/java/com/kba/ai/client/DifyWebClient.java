package com.kba.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kba.ai.config.DifyConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

/**
 * Dify WebClient 实现类
 *
 * @author kba
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DifyWebClient {

    private final DifyConfig difyConfig;
    private final ObjectMapper objectMapper;

    private WebClient getWebClient() {
        return WebClient.builder()
            .baseUrl(difyConfig.getApiUrl())
            .defaultHeader("Authorization", "Bearer " + difyConfig.getApiKey())
            .build();
    }

    public Flux<String> chatStream(String conversationId, String query, String user) {
        Map<String, Object> body = new HashMap<>();
        body.put("inputs", new HashMap<>());
        body.put("query", query);
        body.put("response_mode", "streaming");
        body.put("conversation_id", conversationId != null ? conversationId : "");
        body.put("user", user);

        return getWebClient().post()
            .uri("/v1/chat-messages")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .bodyToFlux(String.class)
            .doOnError(error -> log.error("Dify chat stream error: {}", error.getMessage()));
    }

    public Mono<Map<String, Object>> chat(String conversationId, String query, String user) {
        Map<String, Object> body = new HashMap<>();
        body.put("inputs", new HashMap<>());
        body.put("query", query);
        body.put("response_mode", "blocking");
        body.put("conversation_id", conversationId != null ? conversationId : "");
        body.put("user", user);

        return getWebClient().post()
            .uri("/v1/chat-messages")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String.class)
            .map(response -> {
                try {
                    return objectMapper.readValue(response, Map.class);
                } catch (Exception e) {
                    log.error("Parse Dify response error: {}", e.getMessage());
                    return new HashMap<String, Object>();
                }
            });
    }

    public Mono<String> extractConversationId(String response) {
        try {
            JsonNode node = objectMapper.readTree(response);
            if (node.has("conversation_id")) {
                return Mono.just(node.get("conversation_id").asText());
            }
        } catch (Exception e) {
            log.error("Extract conversation_id error: {}", e.getMessage());
        }
        return Mono.empty();
    }

    public Mono<String> extractAnswer(String response) {
        try {
            JsonNode node = objectMapper.readTree(response);
            if (node.has("answer")) {
                return Mono.just(node.get("answer").asText());
            }
            if (node.has("event") && "message".equals(node.get("event").asText())) {
                if (node.has("data") && node.get("data").has("content")) {
                    return Mono.just(node.get("data").get("content").asText());
                }
            }
        } catch (Exception e) {
            log.error("Extract answer error: {}", e.getMessage());
        }
        return Mono.empty();
    }
}
