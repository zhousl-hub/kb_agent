package com.kba.common.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * AI 服务配置
 *
 * <p>统一由 Dify 作为 RAG 与 Agent 引擎，检索、索引、对话生成均在 Dify 内闭环。</p>
 *
 * @author kba
 */
@Configuration
@ConfigurationProperties(prefix = "ai")
public class AiProperties {

    private Dify dify = new Dify();

    public Dify getDify() {
        return dify;
    }

    public void setDify(Dify dify) {
        this.dify = dify;
    }

    public static class Dify {
        private String baseUrl = "http://dify-api:5001";
        private int timeout = 60000;

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public int getTimeout() {
            return timeout;
        }

        public void setTimeout(int timeout) {
            this.timeout = timeout;
        }
    }
}
