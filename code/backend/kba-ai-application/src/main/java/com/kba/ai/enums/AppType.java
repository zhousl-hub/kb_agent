package com.kba.ai.enums;

/**
 * 应用类型枚举
 *
 * @author kba
 */
public enum AppType {

    CHAT("chat", "对话应用"),
    COMPLETION("completion", "补全应用"),
    AGENT("agent", "Agent应用"),
    WORKFLOW("workflow", "工作流应用");

    private final String code;
    private final String description;

    AppType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
