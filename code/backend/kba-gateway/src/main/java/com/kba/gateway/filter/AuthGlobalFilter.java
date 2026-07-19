package com.kba.gateway.filter;

import cn.dev33.satoken.reactor.context.SaReactorSyncHolder;
import cn.dev33.satoken.stp.StpUtil;
import com.kba.common.core.constant.Constants;
import com.kba.gateway.constant.GatewayAuthConstants;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * 认证过滤器：解析 Token 并向下游注入用户上下文请求头
 */
@Component
public class AuthGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        SaReactorSyncHolder.setContext(exchange);
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        if (GatewayAuthConstants.isWhitePath(path)) {
            return chain.filter(exchange);
        }

        Object loginId = StpUtil.getLoginIdDefaultNull();
        if (loginId == null) {
            return chain.filter(exchange);
        }

        ServerHttpRequest mutatedRequest = request.mutate()
            .header(Constants.USER_ID_HEADER, loginId.toString())
            .header(Constants.TENANT_ID_HEADER, resolveTenantId())
            .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private String resolveTenantId() {
        try {
            String tenantId = StpUtil.getSession().getString("tenantId");
            return tenantId != null ? tenantId : "1";
        } catch (Exception e) {
            return "1";
        }
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
