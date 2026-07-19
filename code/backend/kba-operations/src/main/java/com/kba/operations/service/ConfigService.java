package com.kba.operations.service;

import java.util.List;
import java.util.Map;

/**
 * 配置服务接口
 *
 * @author kba
 */
public interface ConfigService {

    List<Map<String, Object>> listConfigs();

    List<Map<String, Object>> getConfigsByGroup(String group);

    String getConfigValue(String key);

    void updateConfig(String key, Map<String, Object> config);

    void createConfig(Map<String, Object> config);

    void deleteConfig(String key);

    void refreshCache();

    List<String> listGroups();
}
