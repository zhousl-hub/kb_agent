package com.kba.knowledge.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 搜索请求
 *
 * @author kba
 */
@Data
public class SearchRequest {

    @NotBlank(message = "查询内容不能为空")
    private String query;

    private Long knowledgeId;

    private Integer topK = 5;

    private Double scoreThreshold = 0.5;
}
