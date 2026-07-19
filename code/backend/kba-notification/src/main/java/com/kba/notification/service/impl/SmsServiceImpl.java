package com.kba.notification.service.impl;

import com.kba.common.core.exception.BusinessException;
import com.kba.notification.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsServiceImpl implements SmsService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String SMS_VERIFY_CODE_PREFIX = "sms:verify:code:";
    private static final long VERIFY_CODE_EXPIRE_MINUTES = 5;

    @Override
    public void sendSms(String phone, String content) {
        try {
            log.info("发送短信: phone={}, content={}", phone, content);
            logSmsSend(phone, content, "success");
        } catch (Exception e) {
            log.error("短信发送失败: phone={}", phone, e);
            throw new BusinessException(500, "短信发送失败: " + e.getMessage());
        }
    }

    @Override
    public void sendSmsWithTemplate(String phone, String templateCode, Map<String, Object> params) {
        try {
            String content = buildSmsContent(templateCode, params);
            log.info("发送模板短信: phone={}, templateCode={}, content={}", phone, templateCode, content);
            logSmsSend(phone, content, "success");
        } catch (Exception e) {
            log.error("模板短信发送失败: phone={}, templateCode={}", phone, templateCode, e);
            throw new BusinessException(500, "模板短信发送失败: " + e.getMessage());
        }
    }

    @Override
    public void sendVerificationCode(String phone, String code) {
        try {
            String key = SMS_VERIFY_CODE_PREFIX + phone;
            redisTemplate.opsForValue().set(key, code, VERIFY_CODE_EXPIRE_MINUTES, TimeUnit.MINUTES);
            
            String content = "您的验证码是：" + code + "，有效期5分钟，请勿泄露给他人。";
            log.info("发送验证码短信: phone={}", phone);
            logSmsSend(phone, content, "success");
        } catch (Exception e) {
            log.error("验证码短信发送失败: phone={}", phone, e);
            throw new BusinessException(500, "验证码发送失败: " + e.getMessage());
        }
    }

    public boolean verifyCode(String phone, String code) {
        String key = SMS_VERIFY_CODE_PREFIX + phone;
        Object storedCode = redisTemplate.opsForValue().get(key);
        
        if (storedCode == null) {
            log.warn("验证码不存在或已过期: phone={}", phone);
            return false;
        }
        
        boolean valid = storedCode.toString().equals(code);
        if (valid) {
            redisTemplate.delete(key);
            log.info("验证码验证成功: phone={}", phone);
        } else {
            log.warn("验证码验证失败: phone={}, inputCode={}, storedCode={}", phone, code, storedCode);
        }
        
        return valid;
    }

    public String generateVerifyCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    private String buildSmsContent(String templateCode, Map<String, Object> params) {
        return switch (templateCode) {
            case "verify_code" -> {
                String code = params.getOrDefault("code", "").toString();
                yield "您的验证码是：" + code + "，有效期5分钟，请勿泄露给他人。";
            }
            case "order_notify" -> {
                String orderNo = params.getOrDefault("orderNo", "").toString();
                yield "您的订单" + orderNo + "已提交成功，请耐心等待处理。";
            }
            case "delivery_notify" -> {
                String expressNo = params.getOrDefault("expressNo", "").toString();
                yield "您的包裹已发货，快递单号：" + expressNo + "，请注意查收。";
            }
            default -> {
                String content = params.getOrDefault("content", "").toString();
                yield content;
            }
        };
    }

    private void logSmsSend(String phone, String content, String result) {
        log.debug("SMS_LOG - phone: {}, content: {}, result: {}", phone, maskPhone(phone), result);
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }
}
