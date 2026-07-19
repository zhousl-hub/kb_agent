package com.kba.gateway.config;

import cn.dev33.satoken.reactor.filter.SaReactorFilter;
import cn.dev33.satoken.router.SaRouter;
import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.kba.gateway.constant.GatewayAuthConstants;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 网关统一鉴权（Sa-Token Reactor 集成）
 */
@Configuration
public class SaTokenGatewayConfig {

    @Bean
    public SaReactorFilter saReactorFilter() {
        return new SaReactorFilter()
            .addInclude("/**")
            .addExclude(buildExcludePaths())
            .setAuth(obj -> SaRouter.match("/**", r -> StpUtil.checkLogin()))
            .setError(e -> SaResult.get(401, e.getMessage(), null));
    }

    private String[] buildExcludePaths() {
        String[] whitePaths = GatewayAuthConstants.whitePathArray();
        String[] excludes = new String[whitePaths.length + 2];
        excludes[0] = "/favicon.ico";
        excludes[1] = "/actuator/**";
        System.arraycopy(whitePaths, 0, excludes, 2, whitePaths.length);
        return excludes;
    }
}
