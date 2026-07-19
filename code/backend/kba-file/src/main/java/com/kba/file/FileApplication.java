package com.kba.file;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * KBA 文件服务启动类
 *
 * @author kba
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.kba")
public class FileApplication {

    public static void main(String[] args) {
        SpringApplication.run(FileApplication.class, args);
    }
}