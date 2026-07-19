package com.kba.identity.service;

import java.util.List;
import java.util.Map;

/**
 * 用户待办服务
 */
public interface UserTodoService {

    List<Map<String, Object>> listByCurrentUser();

    Map<String, Object> create(String content);

    void toggle(Long id, boolean completed);

    void delete(Long id);
}
