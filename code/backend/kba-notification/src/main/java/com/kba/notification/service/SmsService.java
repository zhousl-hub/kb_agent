package com.kba.notification.service;

/**
 * 短信服务接口
 *
 * @author kba
 */
public interface SmsService {

    void sendSms(String phone, String content);

    void sendSmsWithTemplate(String phone, String templateCode, java.util.Map<String, Object> params);

    void sendVerificationCode(String phone, String code);
}
