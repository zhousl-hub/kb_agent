package com.kba.file.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * 存储服务接口
 *
 * @author kba
 */
public interface StorageService {

    String upload(MultipartFile file, String bucket, String path);

    InputStream download(String bucket, String objectName);

    void delete(String bucket, String objectName);

    String getPresignedUrl(String bucket, String objectName, long expires);

    boolean exists(String bucket, String objectName);

    void copy(String sourceBucket, String sourceObject, String targetBucket, String targetObject);
}
