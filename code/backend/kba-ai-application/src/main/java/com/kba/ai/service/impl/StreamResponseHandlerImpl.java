package com.kba.ai.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kba.ai.service.StreamResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StreamResponseHandlerImpl implements StreamResponseHandler {

    private final ObjectMapper objectMapper;

    private static final String DATA_PREFIX = "data: ";
    private static final String DONE_EVENT = "[DONE]";

    @Override
    public Flux<String> handleStream(String content) {
        if (content == null || content.isEmpty()) {
            return Flux.empty();
        }

        String[] lines = content.split("\n");
        List<String> chunks = new ArrayList<>();

        for (String line : lines) {
            if (line == null || line.isEmpty()) {
                continue;
            }

            if (line.startsWith(DATA_PREFIX)) {
                String data = line.substring(DATA_PREFIX.length());
                if (DONE_EVENT.equals(data)) {
                    break;
                }
                chunks.add(data);
            } else {
                chunks.add(line);
            }
        }

        return Flux.fromIterable(chunks)
            .filter(chunk -> !chunk.isEmpty())
            .doOnNext(chunk -> log.debug("Processing chunk: {}", chunk));
    }

    @Override
    public String parseChunk(String chunk) {
        if (chunk == null || chunk.isEmpty()) {
            return "";
        }

        try {
            JsonNode node = objectMapper.readTree(chunk);

            if (node.has("choices")) {
                JsonNode choices = node.get("choices");
                if (choices.isArray() && choices.size() > 0) {
                    JsonNode delta = choices.get(0).get("delta");
                    if (delta != null && delta.has("content")) {
                        return delta.get("content").asText();
                    }
                }
            }

            if (node.has("answer")) {
                return node.get("answer").asText();
            }

            if (node.has("event")) {
                String event = node.get("event").asText();
                if ("message".equals(event) && node.has("data")) {
                    JsonNode data = node.get("data");
                    if (data.has("content")) {
                        return data.get("content").asText();
                    }
                }
            }

            if (node.has("content")) {
                return node.get("content").asText();
            }

            if (node.has("text")) {
                return node.get("text").asText();
            }

            return "";
        } catch (Exception e) {
            log.error("Parse chunk error: {}", e.getMessage());
            return "";
        }
    }

    @Override
    public boolean isComplete(String chunk) {
        if (chunk == null || chunk.isEmpty()) {
            return true;
        }

        try {
            JsonNode node = objectMapper.readTree(chunk);

            if (node.has("event")) {
                String event = node.get("event").asText();
                return "message_end".equals(event)
                    || "done".equals(event)
                    || "error".equals(event);
            }

            if (node.has("choices")) {
                JsonNode choices = node.get("choices");
                if (choices.isArray() && choices.size() > 0) {
                    JsonNode finishReason = choices.get(0).get("finish_reason");
                    return finishReason != null && !"null".equals(finishReason.asText());
                }
            }

            if (node.has("done")) {
                return node.get("done").asBoolean(false);
            }

            return false;
        } catch (Exception e) {
            log.debug("Check complete error: {}", e.getMessage());
            return false;
        }
    }
}
