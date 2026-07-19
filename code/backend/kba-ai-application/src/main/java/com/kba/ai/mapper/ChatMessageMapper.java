package com.kba.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kba.ai.entity.ChatMessage;
import org.apache.ibatis.annotations.Mapper;

/**
 * 对话消息Mapper
 *
 * @author kba
 */
@Mapper
public interface ChatMessageMapper extends BaseMapper<ChatMessage> {
}
