package com.kba.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * 非 dev 环境路由补充（与 application.yml 保持一致，网关完整转发）
 */
@Configuration
@Profile("!dev")
public class RouterConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("identity-service", r -> r
                .path("/api/v1/auth/**", "/api/v1/users/**", "/api/v1/roles/**")
                .uri("lb://identity-service"))
            .route("knowledge-service", r -> r
                .path("/api/v1/knowledge/**", "/api/v1/documents/**", "/api/v1/search/**",
                    "/api/v1/data-sources/**", "/api/v1/sync-tasks/**", "/api/v1/favorites/**",
                    "/api/v1/reports/**")
                .uri("lb://knowledge-service"))
            .route("ai-application-service", r -> r
                .path("/api/v1/apps/**", "/api/v1/assistants/**", "/api/v1/assistant-sessions/**",
                    "/api/v1/chat/**", "/api/v1/models/**", "/api/v1/model-providers/**",
                    "/api/v1/model-routers/**")
                .uri("lb://ai-application-service"))
            .route("notification-service", r -> r
                .path("/api/v1/notifications/**", "/api/v1/email/**", "/api/v1/sms/**")
                .uri("lb://notification-service"))
            .route("file-service", r -> r
                .path("/api/v1/files/**")
                .uri("lb://file-service"))
            .route("operations-service", r -> r
                .path("/api/v1/monitor/**", "/api/v1/audit/**", "/api/v1/config/**")
                .uri("lb://operations-service"))
            .build();
    }
}
