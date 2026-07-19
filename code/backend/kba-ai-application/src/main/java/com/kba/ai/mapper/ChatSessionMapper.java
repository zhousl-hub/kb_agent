package com.kba.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kba.ai.entity.ChatSession;
import org.apache.ibatis.annotations.Mapper;

/**
 * 对话会话Mapper
 *
 * @author kba
 */
@Mapper
public interface ChatSessionMapper extends BaseMapper<ChatSession> {
}
