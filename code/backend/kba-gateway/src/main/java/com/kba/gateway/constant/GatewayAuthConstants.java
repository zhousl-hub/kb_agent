package com.kba.gateway.constant;

import java.util.List;

/**
 * 网关鉴权白名单（与 SaReactorFilter、AuthGlobalFilter 共用）
 */
public final class GatewayAuthConstants {

    private GatewayAuthConstants() {
    }

    /** 无需登录即可访问的路径前缀 */
    public static final List<String> WHITE_PATHS = List.of(
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/auth/captcha"
    );

    public static String[] whitePathArray() {
        return WHITE_PATHS.toArray(new String[0]);
    }

    public static boolean isWhitePath(String path) {
        if (path == null || path.isEmpty()) {
            return false;
        }
        for (String whitePath : WHITE_PATHS) {
            if (path.equals(whitePath) || path.startsWith(whitePath + "/")) {
                return true;
            }
        }
        return false;
    }
}
