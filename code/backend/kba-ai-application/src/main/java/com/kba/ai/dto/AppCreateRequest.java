package com.kba.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 应用创建请求
 *
 * @author kba
 */
@Data
public class AppCreateRequest {

    @NotBlank(message = "应用名称不能为空")
    private String name;

    private String description;

    @NotBlank(message = "应用类型不能为空")
    private String type;

    private Long modelId;

    private Long knowledgeId;

    private String promptTemplate;
}
