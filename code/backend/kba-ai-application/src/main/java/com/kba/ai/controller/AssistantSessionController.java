package com.kba.ai.controller;

import com.kba.ai.service.AssistantSessionService;
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
 * 助手会话控制器
 *
 * @author kba
 */
@Tag(name = "助手会话管理")
@RestController
@RequiredArgsConstructor
public class AssistantSessionController {

    private final AssistantSessionService assistantSessionService;

    @Operation(summary = "获取助手的会话列表")
    @GetMapping("/assistants/{id}/sessions")
    public R<List<Map<String, Object>>> getSessionsByAssistantId(
            @PathVariable Long id,
            @RequestParam(value = "pageNum", defaultValue = "1") int pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize) {
        return R.ok(assistantSessionService.getSessionsByAssistantId(id, pageNum, pageSize));
    }

    @Operation(summary = "获取所有助手会话")
    @GetMapping("/assistant-sessions")
    public R<List<Map<String, Object>>> getAllSessions(
            @RequestParam(value = "pageNum", defaultValue = "1") int pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "search", required = false) String search) {
        return R.ok(assistantSessionService.getAllSessions(pageNum, pageSize, search));
    }

    @Operation(summary = "清空当前用户所有会话")
    @DeleteMapping("/assistant-sessions")
    public R<Void> clearAllSessions() {
        assistantSessionService.clearAllForCurrentUser();
        return R.ok();
    }

    @Operation(summary = "创建助手会话")
    @PostMapping("/assistant-sessions")
    public R<Map<String, Object>> createSession(
            @RequestParam("assistantId") Long assistantId,
            @RequestParam(value = "title", required = false) String title) {
        return R.ok(assistantSessionService.createSession(assistantId, title));
    }

    @Operation(summary = "获取会话详情")
    @GetMapping("/assistant-sessions/{id}")
    public R<Map<String, Object>> getSessionById(@PathVariable Long id) {
        return R.ok(assistantSessionService.getSessionById(id));
    }

    @Operation(summary = "获取会话消息列表")
    @GetMapping("/assistant-sessions/{id}/messages")
    public R<List<Map<String, Object>>> getMessages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize) {
        return R.ok(assistantSessionService.getMessages(id, pageNum, pageSize));
    }

    @Operation(summary = "发送消息(SSE流式响应)")
    @PostMapping(value = "/assistant-sessions/{id}/messages", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> sendMessage(
            @PathVariable Long id,
            @RequestParam("assistantId") Long assistantId,
            @RequestParam("content") String content,
            @RequestParam(value = "stream", defaultValue = "true") boolean stream) {
        return assistantSessionService.sendMessage(assistantId, id, content, stream);
    }

    @Operation(summary = "删除会话")
    @DeleteMapping("/assistant-sessions/{id}")
    public R<Void> deleteSession(@PathVariable Long id) {
        assistantSessionService.deleteSession(id);
        return R.ok();
    }

    @Operation(summary = "与助手对话(SSE流式响应)")
    @PostMapping(value = "/assistant/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(
            @RequestParam("assistantId") Long assistantId,
            @RequestParam("sessionId") Long sessionId,
            @RequestParam("content") String content,
            @RequestParam(value = "stream", defaultValue = "true") boolean stream) {
        return assistantSessionService.sendMessage(assistantId, sessionId, content, stream);
    }
}
