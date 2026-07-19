package com.kba.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 模型创建请求
 *
 * @author kba
 */
@Data
public class ModelCreateRequest {

    @NotBlank(message = "模型名称不能为空")
    private String name;

    @NotBlank(message = "提供商不能为空")
    private String provider;

    @NotBlank(message = "模型标识不能为空")
    private String modelName;

    private String apiKey;

    private String apiEndpoint;

    private Integer maxTokens = 4096;

    private Double temperature = 0.7;
}
