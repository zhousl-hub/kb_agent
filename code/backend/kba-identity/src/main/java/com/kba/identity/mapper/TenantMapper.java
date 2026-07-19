package com.kba.identity.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kba.identity.entity.Tenant;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TenantMapper extends BaseMapper<Tenant> {
}
