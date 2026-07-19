package com.kba.knowledge.enums;

/**
 * 同步状态枚举
 *
 * @author kba
 */
public enum SyncStatus {

    PENDING("pending", "待处理"),
    RUNNING("running", "处理中"),
    COMPLETED("completed", "已完成"),
    FAILED("failed", "失败"),
    CANCELLED("cancelled", "已取消");

    private final String code;
    private final String description;

    SyncStatus(String code, String description) {
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
