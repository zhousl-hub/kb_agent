package com.kba.ai.controller;

import com.kba.ai.service.ChatService;
import com.kba.common.core.result.R;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

/**
 * 对话控制器
 *
 * @author kba
 */
@Tag(name = "对话管理")
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "创建对话会话")
    @PostMapping("/sessions")
    public R<Map<String, Object>> createSession(
            @RequestParam(value = "appId", required = false) Long appId,
            @RequestParam(value = "title", required = false) String title) {
        return R.ok(chatService.createSession(appId, title));
    }

    @Operation(summary = "获取对话会话列表")
    @GetMapping("/sessions")
    public R<List<Map<String, Object>>> getSessions(
            @RequestParam(value = "appId", required = false) Long appId,
            @RequestParam(value = "pageNum", defaultValue = "1") int pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize) {
        return R.ok(chatService.getSessions(appId, pageNum, pageSize));
    }

    @Operation(summary = "获取对话消息列表")
    @GetMapping("/sessions/{sessionId}/messages")
    public R<List<Map<String, Object>>> getMessages(
            @PathVariable Long sessionId,
            @RequestParam(value = "pageNum", defaultValue = "1") int pageNum,
            @RequestParam(value = "pageSize", defaultValue = "20") int pageSize) {
        return R.ok(chatService.getMessages(sessionId, pageNum, pageSize));
    }

    @Operation(summary = "发送消息(SSE流式响应)")
    @PostMapping(value = "/send", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> sendMessage(
            @RequestParam("appId") Long appId,
            @RequestParam("sessionId") Long sessionId,
            @RequestParam("content") String content,
            @RequestParam(value = "stream", defaultValue = "true") boolean stream) {
        return chatService.sendMessage(appId, sessionId, content, stream);
    }

    @Operation(summary = "删除对话会话")
    @DeleteMapping("/sessions/{sessionId}")
    public R<Void> deleteSession(@PathVariable Long sessionId) {
        chatService.deleteSession(sessionId);
        return R.ok();
    }
}
