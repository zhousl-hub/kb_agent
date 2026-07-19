package com.kba.knowledge.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 文档服务接口
 *
 * @author kba
 */
public interface DocumentService {

    Map<String, Object> listPage(int pageNum, int pageSize, Long knowledgeId);

    Map<String, Object> getById(Long id);

    void delete(Long id);

    Map<String, Object> upload(Long knowledgeId, MultipartFile file);

    void process(Long id);

    List<Map<String, Object>> listRecent(int limit);
}
