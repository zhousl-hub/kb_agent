package com.kba.notification.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kba.notification.entity.Notification;
import org.apache.ibatis.annotations.Mapper;

/**
 * 通知Mapper
 *
 * @author kba
 */
@Mapper
public interface NotificationMapper extends BaseMapper<Notification> {
}
