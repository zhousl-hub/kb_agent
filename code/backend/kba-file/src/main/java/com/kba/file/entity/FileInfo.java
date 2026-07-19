package com.kba.file.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件信息实体
 *
 * @author kba
 */
@Data
@TableName("file_info")
public class FileInfo {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String fileName;

    private String originalName;

    private String filePath;

    private String bucket;

    private String contentType;

    private Long fileSize;

    private String md5;

    private String storageType;

    private Long tenantId;

    private Long userId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
