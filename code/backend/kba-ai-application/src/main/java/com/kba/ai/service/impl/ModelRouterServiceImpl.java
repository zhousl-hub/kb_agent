package com.kba.ai.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.ai.entity.ModelRouter;
import com.kba.ai.mapper.ModelRouterMapper;
import com.kba.ai.service.ModelRouterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 模型路由服务实现
 *
 * @author kba
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ModelRouterServiceImpl implements ModelRouterService {

    private final ModelRouterMapper modelRouterMapper;

    @Override
    public Map<String, Object> listPage(int pageNum, int pageSize, String keyword, String status) {
        LambdaQueryWrapper<ModelRouter> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(ModelRouter::getName, keyword);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(ModelRouter::getStatus, status);
        }
        wrapper.orderByAsc(ModelRouter::getPriority);
        wrapper.orderByDesc(ModelRouter::getCreatedAt);
        Page<ModelRouter> page = modelRouterMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        Map<String, Object> result = new HashMap<>();
        result.put("records", page.getRecords());
        result.put("total", page.getTotal());
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        return result;
    }

    @Override
    public List<ModelRouter> listAll() {
        return modelRouterMapper.selectList(
                new LambdaQueryWrapper<ModelRouter>()
                        .eq(ModelRouter::getStatus, "active")
                        .orderByAsc(ModelRouter::getPriority)
        );
    }

    @Override
    public ModelRouter getById(Long id) {
        return modelRouterMapper.selectById(id);
    }

    @Override
    public ModelRouter create(ModelRouter router) {
        router.setStatus("active");
        router.setPriority(router.getPriority() != null ? router.getPriority() : 0);
        router.setCreatedBy(StpUtil.getLoginIdAsLong());
        modelRouterMapper.insert(router);
        return router;
    }

    @Override
    public ModelRouter update(Long id, ModelRouter router) {
        router.setId(id);
        modelRouterMapper.updateById(router);
        return router;
    }

    @Override
    public void delete(Long id) {
        modelRouterMapper.deleteById(id);
    }

    @Override
    public void updateStatus(Long id, String status) {
        ModelRouter router = modelRouterMapper.selectById(id);
        if (router != null) {
            router.setStatus(status);
            modelRouterMapper.updateById(router);
        }
    }

    @Override
    public void updatePriority(Long id, Integer priority) {
        ModelRouter router = modelRouterMapper.selectById(id);
        if (router != null) {
            router.setPriority(priority);
            modelRouterMapper.updateById(router);
        }
    }

    @Override
    public Map<String, Object> testRoute(Long id, String prompt) {
        ModelRouter router = modelRouterMapper.selectById(id);
        Map<String, Object> result = new HashMap<>();
        if (router == null) {
            result.put("success", false);
            result.put("message", "路由不存在");
            return result;
        }
        result.put("success", true);
        result.put("routedModel", router.getTargetModel());
        result.put("providerId", router.getProviderId());
        return result;
    }
}
