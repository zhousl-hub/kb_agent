package com.kba.file.dto;

import lombok.Data;

/**
 * 文件上传请求
 *
 * @author kba
 */
@Data
public class FileUploadRequest {

    private String bucket;

    private String path;

    private String fileName;

    private String contentType;

    private Long fileSize;

    private String md5;

    private Long tenantId;

    private Long userId;
}
