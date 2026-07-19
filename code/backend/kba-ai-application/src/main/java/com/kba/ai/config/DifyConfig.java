package com.kba.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Dify配置
 *
 * @author kba
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "dify")
public class DifyConfig {

    private String apiUrl;

    private String apiKey;

    private int timeout = 60000;
}
