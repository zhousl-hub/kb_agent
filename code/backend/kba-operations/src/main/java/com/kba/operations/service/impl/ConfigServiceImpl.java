package com.kba.operations.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.kba.operations.service.ConfigService;
import com.kba.operations.entity.SystemConfig;
import com.kba.operations.mapper.SystemConfigMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConfigServiceImpl implements ConfigService {

    private final SystemConfigMapper systemConfigMapper;

    @Override
    public List<Map<String, Object>> listConfigs() {
        return systemConfigMapper.selectList(null).stream()
            .map(this::toMap)
            .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getConfigsByGroup(String group) {
        return systemConfigMapper.selectList(
                new LambdaQueryWrapper<SystemConfig>().eq(SystemConfig::getConfigGroup, group)
            ).stream()
            .map(this::toMap)
            .collect(Collectors.toList());
    }

    @Override
    public String getConfigValue(String key) {
        SystemConfig config = findByKey(key);
        if (config == null) {
            return null;
        }
        return config.getConfigValue();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateConfig(String key, Map<String, Object> config) {
        SystemConfig existing = findByKey(key);
        if (existing == null) {
            throw new RuntimeException("Config not found: " + key);
        }
        
        if (config.containsKey("configValue")) {
            existing.setConfigValue((String) config.get("configValue"));
        }
        if (config.containsKey("configName")) {
            existing.setConfigName((String) config.get("configName"));
        }
        if (config.containsKey("description")) {
            existing.setDescription((String) config.get("description"));
        }
        if (config.containsKey("sortOrder")) {
            existing.setSortOrder((Integer) config.get("sortOrder"));
        }
        if (config.containsKey("status")) {
            existing.setStatus((Integer) config.get("status"));
        }
        
        existing.setUpdatedAt(LocalDateTime.now());
        systemConfigMapper.updateById(existing);
        log.info("Updated config: key={}", key);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createConfig(Map<String, Object> config) {
        SystemConfig systemConfig = new SystemConfig();
        systemConfig.setConfigKey((String) config.get("configKey"));
        systemConfig.setConfigValue((String) config.get("configValue"));
        systemConfig.setConfigName((String) config.get("configName"));
        systemConfig.setConfigGroup((String) config.get("configGroup"));
        systemConfig.setDescription((String) config.get("description"));
        systemConfig.setSortOrder(config.containsKey("sortOrder") ? (Integer) config.get("sortOrder") : 0);
        systemConfig.setStatus(config.containsKey("status") ? (Integer) config.get("status") : 1);
        systemConfig.setTenantId(config.containsKey("tenantId") ? ((Number) config.get("tenantId")).longValue() : null);
        systemConfig.setCreatedAt(LocalDateTime.now());
        systemConfig.setUpdatedAt(LocalDateTime.now());
        
        // 原仓储 save 逻辑：无主键则插入，否则更新
        if (systemConfig.getId() == null) {
            systemConfigMapper.insert(systemConfig);
        } else {
            systemConfigMapper.updateById(systemConfig);
        }
        log.info("Created config: key={}", systemConfig.getConfigKey());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteConfig(String key) {
        SystemConfig existing = findByKey(key);
        if (existing == null) {
            throw new RuntimeException("Config not found: " + key);
        }
        
        // 原仓储 deleteByKey 逻辑：按 configKey 删除
        systemConfigMapper.delete(
            new LambdaQueryWrapper<SystemConfig>().eq(SystemConfig::getConfigKey, key)
        );
        log.info("Deleted config: key={}", key);
    }

    @Override
    public void refreshCache() {
        log.info("Config cache refreshed");
    }

    @Override
    public List<String> listGroups() {
        // 原仓储 findAllGroups 逻辑：按 configGroup 分组查询后去重
        List<SystemConfig> configs = systemConfigMapper.selectList(
            new LambdaQueryWrapper<SystemConfig>()
                .select(SystemConfig::getConfigGroup)
                .groupBy(SystemConfig::getConfigGroup)
        );
        return configs.stream()
            .map(SystemConfig::getConfigGroup)
            .filter(g -> g != null && !g.isEmpty())
            .distinct()
            .collect(Collectors.toList());
    }

    /**
     * 原仓储 findByKey 逻辑：按 configKey 查询单条配置
     */
    private SystemConfig findByKey(String key) {
        return systemConfigMapper.selectOne(
            new LambdaQueryWrapper<SystemConfig>().eq(SystemConfig::getConfigKey, key)
        );
    }

    private Map<String, Object> toMap(SystemConfig config) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", config.getId());
        map.put("configKey", config.getConfigKey());
        map.put("configValue", config.getConfigValue());
        map.put("configName", config.getConfigName());
        map.put("configGroup", config.getConfigGroup());
        map.put("description", config.getDescription());
        map.put("sortOrder", config.getSortOrder());
        map.put("status", config.getStatus());
        map.put("tenantId", config.getTenantId());
        map.put("createdAt", config.getCreatedAt());
        map.put("updatedAt", config.getUpdatedAt());
        return map;
    }
}
