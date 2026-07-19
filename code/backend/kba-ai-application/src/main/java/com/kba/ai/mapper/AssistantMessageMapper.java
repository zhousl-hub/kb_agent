package com.kba.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kba.ai.entity.AssistantMessage;
import org.apache.ibatis.annotations.Mapper;

/**
 * 助手消息Mapper
 *
 * @author kba
 */
@Mapper
public interface AssistantMessageMapper extends BaseMapper<AssistantMessage> {
}
