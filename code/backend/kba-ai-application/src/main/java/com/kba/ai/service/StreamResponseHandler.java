package com.kba.ai.service;

import reactor.core.publisher.Flux;

/**
 * 流式响应处理器接口
 *
 * @author kba
 */
public interface StreamResponseHandler {

    Flux<String> handleStream(String content);

    String parseChunk(String chunk);

    boolean isComplete(String chunk);
}
