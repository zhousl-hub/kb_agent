package com.kba.identity.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sys_permission")
public class SysPermission {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String code;

    private String resource;

    private String action;

    private Long parentId;

    private Integer type;

    private Integer status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
