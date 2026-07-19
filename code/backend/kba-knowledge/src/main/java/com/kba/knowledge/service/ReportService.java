package com.kba.knowledge.service;

import com.kba.common.core.result.PageResult;
import com.kba.knowledge.entity.Report;

import java.util.List;
import java.util.Map;

/**
 * 报告服务接口
 *
 * @author kba
 */
public interface ReportService {

    PageResult<Report> listPage(int pageNum, int pageSize, String keyword, String status);

    Report getById(Long id);

    Report create(Report report);

    Report update(Long id, Report report);

    void delete(Long id);

    Report publish(Long id);

    List<?> search(Map<String, Object> body);
}
