package com.kba.common.ai.service;

import com.kba.common.ai.config.AiProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Dify 服务客户端
 *
 * @author kba
 */
@Service
public class DifyClient {

    private static final Logger log = LoggerFactory.getLogger(DifyClient.class);

    private final AiProperties aiProperties;
    private final RestTemplate restTemplate = new RestTemplate();

    public DifyClient(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
    }

    public Object chat(String appId, String query, String conversationId, String user) {
        String url = aiProperties.getDify().getBaseUrl() + "/v1/chat-messages";
        Map<String, Object> body = Map.of(
                "inputs", Map.of(),
                "query", query,
                "response_mode", "blocking",
                "conversation_id", conversationId != null ? conversationId : "",
                "user", user
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + getAppApiKey(appId));
        HttpEntity<Object> entity = new HttpEntity<>(body, headers);
        log.debug("Dify chat request to: {}", url);
        return restTemplate.postForObject(url, entity, Object.class);
    }

    public Object getApps(int page, int limit) {
        String url = aiProperties.getDify().getBaseUrl() + "/v1/apps?page=" + page + "&limit=" + limit;
        return get(url);
    }

    public Object getKnowledgeBases(String appId) {
        String url = aiProperties.getDify().getBaseUrl() + "/v1/datasets";
        return get(url);
    }

    private String getAppApiKey(String appId) {
        return System.getProperty("dify.api.key." + appId, "app-default-api-key");
    }

    private Object get(String url) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Object> entity = new HttpEntity<>(headers);
        log.debug("GET request to: {}", url);
        return restTemplate.getForObject(url, Object.class);
    }
}