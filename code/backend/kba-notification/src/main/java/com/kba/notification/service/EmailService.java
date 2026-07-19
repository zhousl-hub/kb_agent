package com.kba.notification.service;

/**
 * 邮件服务接口
 *
 * @author kba
 */
public interface EmailService {

    void sendEmail(String to, String subject, String content);

    void sendEmailWithTemplate(String to, String templateCode, java.util.Map<String, Object> params);

    void sendHtmlEmail(String to, String subject, String htmlContent);
}
