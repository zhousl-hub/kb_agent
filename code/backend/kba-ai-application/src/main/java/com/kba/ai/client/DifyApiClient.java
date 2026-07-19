package com.kba.ai.client;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

import java.util.Map;

/**
 * Dify API客户端
 *
 * @author kba
 */
@HttpExchange
public interface DifyApiClient {

    @PostExchange("/v1/chat-messages")
    Map<String, Object> sendMessage(
        @RequestHeader("Authorization") String authorization,
        @RequestBody Map<String, Object> request
    );

    @GetExchange("/v1/messages")
    Map<String, Object> getMessages(
        @RequestHeader("Authorization") String authorization,
        @PathVariable String conversationId
    );

    @PostExchange("/v1/conversations")
    Map<String, Object> createConversation(
        @RequestHeader("Authorization") String authorization,
        @RequestBody Map<String, Object> request
    );

    @GetExchange("/v1/parameters")
    Map<String, Object> getParameters(@RequestHeader("Authorization") String authorization);
}
