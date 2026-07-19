package com.kba.operations;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * KBA 运维服务启动类
 *
 * @author kba
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.kba")
public class OperationsApplication {

    public static void main(String[] args) {
        SpringApplication.run(OperationsApplication.class, args);
    }
}