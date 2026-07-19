package com.kba.common.core.result;

import java.io.Serializable;

/**
 * 统一响应结果
 *
 * @author kba
 */
public class R<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    public static final int SUCCESS = 200;
    public static final int FAIL = 500;

    private int code;
    private String message;
    private T data;
    private long timestamp;

    public R() {
        this.timestamp = System.currentTimeMillis();
    }

    public static <T> R<T> ok() {
        return ok(null);
    }

    public static <T> R<T> ok(T data) {
        R<T> result = new R<>();
        result.setCode(SUCCESS);
        result.setMessage("success");
        result.setData(data);
        return result;
    }

    public static <T> R<T> ok(T data, String message) {
        R<T> result = new R<>();
        result.setCode(SUCCESS);
        result.setMessage(message);
        result.setData(data);
        return result;
    }

    public static <T> R<T> fail() {
        return fail(FAIL, "系统错误");
    }

    public static <T> R<T> fail(String message) {
        return fail(FAIL, message);
    }

    public static <T> R<T> fail(int code, String message) {
        R<T> result = new R<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }

    public static <T> R<T> fail(IErrorCode errorCode) {
        return fail(errorCode.getCode(), errorCode.getMessage());
    }

    public boolean isSuccess() {
        return SUCCESS == this.code;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}