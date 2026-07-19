package com.kba.file.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kba.file.entity.FileInfo;
import org.apache.ibatis.annotations.Mapper;

/**
 * 文件信息Mapper
 *
 * @author kba
 */
@Mapper
public interface FileInfoMapper extends BaseMapper<FileInfo> {
}
