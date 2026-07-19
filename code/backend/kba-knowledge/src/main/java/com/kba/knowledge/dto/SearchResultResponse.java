package com.kba.knowledge.dto;

import lombok.Data;

/**
 * 搜索结果响应
 *
 * @author kba
 */
@Data
public class SearchResultResponse {

    private Long chunkId;

    private String content;

    private Double score;

    private Long knowledgeId;

    private Long dataSourceId;

    private String documentName;
}
