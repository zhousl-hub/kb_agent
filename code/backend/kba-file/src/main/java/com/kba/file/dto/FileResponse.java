package com.kba.file.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件响应
 *
 * @author kba
 */
@Data
public class FileResponse {

    private Long id;

    private String fileName;

    private String originalName;

    private String filePath;

    private String bucket;

    private String contentType;

    private Long fileSize;

    private String md5;

    private String fileUrl;

    private Long tenantId;

    private Long userId;

    private LocalDateTime createdAt;
}
