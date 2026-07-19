package com.kba.file.service;

import com.kba.file.dto.FileResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 文件服务接口
 *
 * @author kba
 */
public interface FileService {

    FileResponse uploadFile(MultipartFile file, String bucket, String path);

    List<FileResponse> batchUploadFiles(MultipartFile[] files, String bucket, String path);

    ResponseEntity<Resource> downloadFile(Long id);

    ResponseEntity<Resource> previewFile(Long id);

    FileResponse getFileInfo(Long id);

    Map<String, Object> listFiles(int pageNum, int pageSize, String bucket, String path, String fileType);

    void deleteFile(Long id);

    void batchDeleteFiles(List<Long> ids);

    String getFileUrl(Long id, long expires);

    FileResponse copyFile(Long id, String targetPath);

    void moveFile(Long id, String targetPath);

    void renameFile(Long id, String newName);
}
