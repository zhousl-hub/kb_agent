package com.kba.knowledge.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.common.core.exception.BusinessException;
import com.kba.common.core.result.PageResult;
import com.kba.knowledge.entity.Report;
import com.kba.knowledge.mapper.ReportMapper;
import com.kba.knowledge.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 报告服务实现
 *
 * @author kba
 */
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportMapper reportMapper;

    @Override
    public PageResult<Report> listPage(int pageNum, int pageSize, String keyword, String status) {
        LambdaQueryWrapper<Report> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Report::getTitle, keyword);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Report::getStatus, status);
        }
        wrapper.orderByDesc(Report::getUpdatedAt);
        Page<Report> page = reportMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        return PageResult.of(page.getRecords(), page.getTotal(), pageNum, pageSize);
    }

    @Override
    public Report getById(Long id) {
        return reportMapper.selectById(id);
    }

    @Override
    public Report create(Report report) {
        report.setVersion(1);
        report.setStatus("draft");
        report.setAuthorId(StpUtil.getLoginIdAsLong());
        report.setCreatedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        reportMapper.insert(report);
        return report;
    }

    @Override
    public Report update(Long id, Report report) {
        Report existing = reportMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException(404, "报告不存在");
        }
        report.setId(id);
        report.setVersion(existing.getVersion() + 1);
        report.setUpdatedAt(LocalDateTime.now());
        reportMapper.updateById(report);
        return report;
    }

    @Override
    public void delete(Long id) {
        reportMapper.deleteById(id);
    }

    @Override
    public Report publish(Long id) {
        Report report = reportMapper.selectById(id);
        if (report == null) {
            throw new BusinessException(404, "报告不存在");
        }
        report.setStatus("published");
        report.setPublishedAt(LocalDateTime.now());
        reportMapper.updateById(report);
        return report;
    }

    @Override
    public List<?> search(Map<String, Object> body) {
        return new ArrayList<>();
    }
}
