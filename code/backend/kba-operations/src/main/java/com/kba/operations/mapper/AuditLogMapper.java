package com.kba.operations.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kba.operations.entity.AuditLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * 审计日志Mapper
 *
 * @author kba
 */
@Mapper
public interface AuditLogMapper extends BaseMapper<AuditLog> {
}
