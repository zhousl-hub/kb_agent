package com.kba.identity.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sys_user")
public class SysUser {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    @TableField("password_hash")
    private String password;

    private String email;

    private String phone;

    @TableField("nickname")
    private String realName;

    private Integer status;

    @TableField(exist = false)
    private Long roleId;

    private String tenantId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @TableField(select = false)
    private SysRole role;
}
