package com.kba.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kba.ai.entity.LLMModel;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LLMModelMapper extends BaseMapper<LLMModel> {
}
