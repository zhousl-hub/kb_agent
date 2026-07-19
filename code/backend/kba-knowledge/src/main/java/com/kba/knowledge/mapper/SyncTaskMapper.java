package com.kba.knowledge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kba.knowledge.entity.SyncTask;
import org.apache.ibatis.annotations.Mapper;

/**
 * 同步任务Mapper
 *
 * @author kba
 */
@Mapper
public interface SyncTaskMapper extends BaseMapper<SyncTask> {
}
