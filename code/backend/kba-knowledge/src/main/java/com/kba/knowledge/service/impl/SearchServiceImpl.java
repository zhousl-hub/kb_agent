package com.kba.knowledge.service.impl;

import com.kba.knowledge.service.SearchService;
import com.kba.knowledge.client.DifyKnowledgeClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final DifyKnowledgeClient difyKnowledgeClient;

    @Override
    public List<Map<String, Object>> search(String query, Long knowledgeId, int topK) {
        if (knowledgeId == null) {
            return new ArrayList<>();
        }
        try {
            List<Map<String, Object>> records = difyKnowledgeClient.retrieve(knowledgeId.toString(), query, topK);
            return extractSearchResults(records);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> advancedSearch(Map<String, Object> params) {
        if (params.get("knowledgeId") == null) {
            return new ArrayList<>();
        }
        String datasetId = params.get("knowledgeId").toString();
        String query = params.get("query") != null ? params.get("query").toString() : "";
        int topK = params.get("topK") != null ? Integer.parseInt(params.get("topK").toString()) : 10;

        try {
            List<Map<String, Object>> records = difyKnowledgeClient.retrieve(datasetId, query, topK);
            return extractSearchResults(records);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Override
    public List<String> getSuggestions(String query, Long knowledgeId) {
        List<String> suggestions = new ArrayList<>();
        suggestions.add(query);
        
        if (query.length() > 1) {
            suggestions.add(query + "相关内容");
            suggestions.add(query + "文档");
        }
        
        return suggestions;
    }

    private List<Map<String, Object>> extractSearchResults(List<Map<String, Object>> records) {
        List<Map<String, Object>> items = new ArrayList<>();
        if (records == null) {
            return items;
        }
        for (Map<String, Object> record : records) {
            Map<String, Object> item = new HashMap<>();
            item.put("content", record.get("content"));
            item.put("score", record.get("score"));
            item.put("documentName", record.get("documentName"));
            items.add(item);
        }
        return items;
    }
}
