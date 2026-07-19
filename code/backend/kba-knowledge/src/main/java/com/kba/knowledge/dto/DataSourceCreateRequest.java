package com.kba.knowledge.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 数据源创建请求
 *
 * @author kba
 */
@Data
public class DataSourceCreateRequest {

    @NotBlank(message = "名称不能为空")
    private String name;

    @NotBlank(message = "类型不能为空")
    private String type;

    private String config;

    private Long knowledgeId;
}
