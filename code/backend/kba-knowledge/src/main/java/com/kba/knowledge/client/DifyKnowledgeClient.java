package com.kba.knowledge.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Dify知识检索客户端
 *
 * @author kba
 */
@Component
public class DifyKnowledgeClient {

    @Value("${dify.api-url:http://dify-api:5001}")
    private String apiUrl;

    @Value("${dify.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 调用Dify知识库检索接口
     *
     * @param datasetId 知识库ID（对应本系统knowledgeId）
     * @param query     检索内容
     * @param topK      返回条数
     * @return 检索结果列表，每条包含content、score、documentName
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> retrieve(String datasetId, String query, int topK) {
        String url = apiUrl + "/v1/datasets/" + datasetId + "/retrieve";

        Map<String, Object> retrievalModel = new HashMap<>();
        retrievalModel.put("top_k", topK);

        Map<String, Object> body = new HashMap<>();
        body.put("query", query);
        body.put("retrieval_model", retrievalModel);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        Map<String, Object> responseBody = response.getBody();

        List<Map<String, Object>> results = new ArrayList<>();
        if (responseBody == null || responseBody.get("records") == null) {
            return results;
        }

        List<Map<String, Object>> records = (List<Map<String, Object>>) responseBody.get("records");
        for (Map<String, Object> record : records) {
            Map<String, Object> item = new HashMap<>();
            Object segment = record.get("segment");
            if (segment instanceof Map) {
                Map<String, Object> segmentMap = (Map<String, Object>) segment;
                item.put("content", segmentMap.get("content"));
                Object document = segmentMap.get("document");
                if (document instanceof Map) {
                    item.put("documentName", ((Map<String, Object>) document).get("name"));
                }
            }
            item.put("score", record.get("score"));
            results.add(item);
        }
        return results;
    }
}
