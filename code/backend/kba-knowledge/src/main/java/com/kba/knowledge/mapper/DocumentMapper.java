package com.kba.knowledge.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kba.knowledge.entity.Document;
import org.apache.ibatis.annotations.Mapper;

/**
 * 文档Mapper
 *
 * @author kba
 */
@Mapper
public interface DocumentMapper extends BaseMapper<Document> {
}
