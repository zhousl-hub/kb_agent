package com.kba.knowledge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kba.knowledge.entity.Knowledge;
import org.apache.ibatis.annotations.Mapper;

/**
 * 知识库Mapper
 *
 * @author kba
 */
@Mapper
public interface KnowledgeMapper extends BaseMapper<Knowledge> {
}
