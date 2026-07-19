package com.kba.notification.service.impl;

import com.kba.common.core.exception.BusinessException;
import com.kba.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    @Override
    public void sendEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            log.info("邮件发送成功: to={}, subject={}", to, subject);
        } catch (Exception e) {
            log.error("邮件发送失败: to={}, subject={}", to, subject, e);
            throw new BusinessException(500, "邮件发送失败: " + e.getMessage());
        }
    }

    @Override
    public void sendEmailWithTemplate(String to, String templateCode, Map<String, Object> params) {
        try {
            String subject = buildSubjectFromTemplate(templateCode, params);
            String htmlContent = buildContentFromTemplate(templateCode, params);
            sendHtmlEmail(to, subject, htmlContent);
            log.info("模板邮件发送成功: to={}, templateCode={}", to, templateCode);
        } catch (Exception e) {
            log.error("模板邮件发送失败: to={}, templateCode={}", to, templateCode, e);
            throw new BusinessException(500, "模板邮件发送失败: " + e.getMessage());
        }
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("HTML邮件发送成功: to={}, subject={}", to, subject);
        } catch (MessagingException e) {
            log.error("HTML邮件发送失败: to={}, subject={}", to, subject, e);
            throw new BusinessException(500, "HTML邮件发送失败: " + e.getMessage());
        }
    }

    private String buildSubjectFromTemplate(String templateCode, Map<String, Object> params) {
        return switch (templateCode) {
            case "verify_code" -> "验证码通知";
            case "password_reset" -> "密码重置通知";
            case "welcome" -> "欢迎加入";
            default -> "系统通知";
        };
    }

    private String buildContentFromTemplate(String templateCode, Map<String, Object> params) {
        return switch (templateCode) {
            case "verify_code" -> {
                String code = params.getOrDefault("code", "").toString();
                yield buildVerifyCodeHtml(code);
            }
            case "password_reset" -> {
                String link = params.getOrDefault("link", "").toString();
                yield buildPasswordResetHtml(link);
            }
            case "welcome" -> {
                String username = params.getOrDefault("username", "用户").toString();
                yield buildWelcomeHtml(username);
            }
            default -> {
                String content = params.getOrDefault("content", "").toString();
                yield buildDefaultHtml(content);
            }
        };
    }

    private String buildVerifyCodeHtml(String code) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 5px;">
                    <h2 style="color: #333;">验证码通知</h2>
                    <p>您的验证码是：<strong style="font-size: 24px; color: #007bff;">%s</strong></p>
                    <p style="color: #666; font-size: 12px;">验证码有效期为5分钟，请勿泄露给他人。</p>
                </div>
            </body>
            </html>
            """.formatted(code);
    }

    private String buildPasswordResetHtml(String link) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 5px;">
                    <h2 style="color: #333;">密码重置</h2>
                    <p>您正在申请重置密码，请点击下方链接完成操作：</p>
                    <p><a href="%s" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">重置密码</a></p>
                    <p style="color: #666; font-size: 12px;">链接有效期为30分钟，如非本人操作请忽略此邮件。</p>
                </div>
            </body>
            </html>
            """.formatted(link);
    }

    private String buildWelcomeHtml(String username) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 5px;">
                    <h2 style="color: #333;">欢迎加入</h2>
                    <p>亲爱的 <strong>%s</strong>，欢迎加入我们！</p>
                    <p>您已成功注册账户，现在可以开始使用我们的服务。</p>
                </div>
            </body>
            </html>
            """.formatted(username);
    }

    private String buildDefaultHtml(String content) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 5px;">
                    <h2 style="color: #333;">系统通知</h2>
                    <p>%s</p>
                </div>
            </body>
            </html>
            """.formatted(content);
    }
}
