package com.kba.notification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * KBA 通知服务启动类
 *
 * @author kba
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.kba")
public class NotificationApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotificationApplication.class, args);
    }
}