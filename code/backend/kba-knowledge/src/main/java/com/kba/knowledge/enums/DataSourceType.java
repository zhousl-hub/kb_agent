package com.kba.knowledge.enums;

/**
 * 数据源类型枚举
 *
 * @author kba
 */
public enum DataSourceType {

    FILE("file", "文件上传"),
    WEB_URL("web_url", "网页链接"),
    NOTION("notion", "Notion"),
    DATABASE("database", "数据库");

    private final String code;
    private final String description;

    DataSourceType(String code, String description) {
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
