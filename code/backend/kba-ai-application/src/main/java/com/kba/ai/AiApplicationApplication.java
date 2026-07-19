package com.kba.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

/**
 * AI应用服务启动类
 *
 * @author kba
 */
@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = "com.kba")
public class AiApplicationApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiApplicationApplication.class, args);
    }
}