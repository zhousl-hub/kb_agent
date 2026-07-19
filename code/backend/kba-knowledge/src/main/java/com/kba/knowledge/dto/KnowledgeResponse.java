package com.kba.knowledge.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 知识库响应
 *
 * @author kba
 */
@Data
public class KnowledgeResponse {

    private Long id;

    private String name;

    private String description;

    private Long spaceId;

    private Integer dataSourceCount;

    private Integer documentCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
