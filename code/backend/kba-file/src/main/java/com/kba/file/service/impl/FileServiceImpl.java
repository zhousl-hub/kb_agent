package com.kba.file.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.common.core.exception.BusinessException;
import com.kba.file.dto.FileResponse;
import com.kba.file.service.FileService;
import com.kba.file.entity.FileInfo;
import com.kba.file.mapper.FileInfoMapper;
import com.kba.file.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final StorageService storageService;
    private final FileInfoMapper fileInfoMapper;

    @Value("${minio.default-bucket:kba}")
    private String defaultBucket;

    @Value("${file.upload.max-size:104857600}")
    private long maxFileSize;

    @Value("${file.upload.allowed-types:}")
    private String allowedTypes;

    private static final long DEFAULT_EXPIRES = 3600;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FileResponse uploadFile(MultipartFile file, String bucket, String path) {
        validateFile(file);
        String targetBucket = StringUtils.hasText(bucket) ? bucket : defaultBucket;
        String md5 = calculateMd5(file);
        FileInfo existingFile = findByMd5(md5);
        if (existingFile != null) {
            return buildInstantUploadResponse(existingFile);
        }
        String objectName = generateObjectName(file.getOriginalFilename(), path);
        storageService.upload(file, targetBucket, path);
        FileInfo fileInfo = new FileInfo();
        fileInfo.setFileName(extractFileName(objectName));
        fileInfo.setOriginalName(file.getOriginalFilename());
        fileInfo.setFilePath(objectName);
        fileInfo.setBucket(targetBucket);
        fileInfo.setContentType(file.getContentType());
        fileInfo.setFileSize(file.getSize());
        fileInfo.setMd5(md5);
        fileInfo.setStorageType("minio");
        fileInfo.setCreatedAt(LocalDateTime.now());
        fileInfo.setUpdatedAt(LocalDateTime.now());
        fileInfo.setDeleted(0);
        fileInfoMapper.insert(fileInfo);
        return buildFileResponse(fileInfo);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<FileResponse> batchUploadFiles(MultipartFile[] files, String bucket, String path) {
        return Arrays.stream(files)
                .map(file -> uploadFile(file, bucket, path))
                .collect(Collectors.toList());
    }

    @Override
    public ResponseEntity<Resource> downloadFile(Long id) {
        FileInfo fileInfo = getFileInfoOrThrow(id);
        InputStream inputStream = storageService.download(fileInfo.getBucket(), fileInfo.getFilePath());
        Resource resource = new InputStreamResource(inputStream);
        String encodedFileName = URLEncoder.encode(fileInfo.getOriginalName(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileInfo.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"")
                .body(resource);
    }

    @Override
    public ResponseEntity<Resource> previewFile(Long id) {
        FileInfo fileInfo = getFileInfoOrThrow(id);
        InputStream inputStream = storageService.download(fileInfo.getBucket(), fileInfo.getFilePath());
        Resource resource = new InputStreamResource(inputStream);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileInfo.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileInfo.getOriginalName() + "\"")
                .body(resource);
    }

    @Override
    public FileResponse getFileInfo(Long id) {
        FileInfo fileInfo = getFileInfoOrThrow(id);
        FileResponse response = buildFileResponse(fileInfo);
        response.setFileUrl(storageService.getPresignedUrl(fileInfo.getBucket(), fileInfo.getFilePath(), DEFAULT_EXPIRES));
        return response;
    }

    @Override
    public Map<String, Object> listFiles(int pageNum, int pageSize, String bucket, String path, String fileType) {
        Page<FileInfo> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<FileInfo> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(StringUtils.hasText(bucket), FileInfo::getBucket, bucket);
        queryWrapper.like(StringUtils.hasText(path), FileInfo::getFilePath, path);
        if (StringUtils.hasText(fileType)) {
            queryWrapper.like(FileInfo::getContentType, fileType);
        }
        queryWrapper.orderByDesc(FileInfo::getCreatedAt);
        IPage<FileInfo> result = fileInfoMapper.selectPage(page, queryWrapper);
        List<FileResponse> responses = result.getRecords().stream()
                .map(this::buildFileResponse)
                .collect(Collectors.toList());
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("list", responses);
        resultMap.put("total", result.getTotal());
        resultMap.put("pageNum", result.getCurrent());
        resultMap.put("pageSize", result.getSize());
        return resultMap;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteFile(Long id) {
        FileInfo fileInfo = getFileInfoOrThrow(id);
        storageService.delete(fileInfo.getBucket(), fileInfo.getFilePath());
        fileInfoMapper.deleteById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchDeleteFiles(List<Long> ids) {
        ids.forEach(this::deleteFile);
    }

    @Override
    public String getFileUrl(Long id, long expires) {
        FileInfo fileInfo = getFileInfoOrThrow(id);
        return storageService.getPresignedUrl(fileInfo.getBucket(), fileInfo.getFilePath(), expires);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FileResponse copyFile(Long id, String targetPath) {
        FileInfo sourceFile = getFileInfoOrThrow(id);
        String targetObjectName = generateObjectName(sourceFile.getOriginalName(), targetPath);
        storageService.copy(sourceFile.getBucket(), sourceFile.getFilePath(), sourceFile.getBucket(), targetObjectName);
        FileInfo newFileInfo = new FileInfo();
        newFileInfo.setFileName(extractFileName(targetObjectName));
        newFileInfo.setOriginalName(sourceFile.getOriginalName());
        newFileInfo.setFilePath(targetObjectName);
        newFileInfo.setBucket(sourceFile.getBucket());
        newFileInfo.setContentType(sourceFile.getContentType());
        newFileInfo.setFileSize(sourceFile.getFileSize());
        newFileInfo.setMd5(sourceFile.getMd5());
        newFileInfo.setStorageType(sourceFile.getStorageType());
        newFileInfo.setTenantId(sourceFile.getTenantId());
        newFileInfo.setUserId(sourceFile.getUserId());
        newFileInfo.setCreatedAt(LocalDateTime.now());
        newFileInfo.setUpdatedAt(LocalDateTime.now());
        newFileInfo.setDeleted(0);
        fileInfoMapper.insert(newFileInfo);
        return buildFileResponse(newFileInfo);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void moveFile(Long id, String targetPath) {
        FileInfo fileInfo = getFileInfoOrThrow(id);
        String targetObjectName = generateObjectName(fileInfo.getOriginalName(), targetPath);
        storageService.copy(fileInfo.getBucket(), fileInfo.getFilePath(), fileInfo.getBucket(), targetObjectName);
        storageService.delete(fileInfo.getBucket(), fileInfo.getFilePath());
        fileInfo.setFilePath(targetObjectName);
        fileInfo.setFileName(extractFileName(targetObjectName));
        fileInfo.setUpdatedAt(LocalDateTime.now());
        fileInfoMapper.updateById(fileInfo);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void renameFile(Long id, String newName) {
        FileInfo fileInfo = getFileInfoOrThrow(id);
        String newFilePath = buildNewFilePath(fileInfo.getFilePath(), newName);
        storageService.copy(fileInfo.getBucket(), fileInfo.getFilePath(), fileInfo.getBucket(), newFilePath);
        storageService.delete(fileInfo.getBucket(), fileInfo.getFilePath());
        fileInfo.setFilePath(newFilePath);
        fileInfo.setFileName(newName);
        fileInfo.setOriginalName(newName);
        fileInfo.setUpdatedAt(LocalDateTime.now());
        fileInfoMapper.updateById(fileInfo);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("文件不能为空");
        }
        if (file.getSize() > maxFileSize) {
            throw new BusinessException("文件大小超过限制，最大允许 " + (maxFileSize / 1024 / 1024) + "MB");
        }
        if (StringUtils.hasText(allowedTypes)) {
            String contentType = file.getContentType();
            List<String> allowedTypeList = Arrays.asList(allowedTypes.split(","));
            if (contentType != null && !allowedTypeList.contains(contentType)) {
                throw new BusinessException("不支持的文件类型: " + contentType);
            }
        }
    }

    private String calculateMd5(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            return DigestUtils.md5DigestAsHex(is);
        } catch (IOException e) {
            log.error("计算文件MD5失败", e);
            throw new BusinessException("计算文件MD5失败");
        }
    }

    private String generateObjectName(String originalFilename, String path) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String extension = "";
        if (StringUtils.hasText(originalFilename)) {
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex);
            }
        }
        String fileName = uuid + extension;
        if (StringUtils.hasText(path)) {
            return path.endsWith("/") ? path + fileName : path + "/" + fileName;
        }
        return fileName;
    }

    private String extractFileName(String objectName) {
        if (objectName == null) {
            return null;
        }
        int lastSlash = objectName.lastIndexOf('/');
        return lastSlash >= 0 ? objectName.substring(lastSlash + 1) : objectName;
    }

    private String buildNewFilePath(String originalPath, String newName) {
        int lastSlash = originalPath.lastIndexOf('/');
        if (lastSlash >= 0) {
            return originalPath.substring(0, lastSlash + 1) + newName;
        }
        return newName;
    }

    private FileInfo getFileInfoOrThrow(Long id) {
        FileInfo fileInfo = fileInfoMapper.selectById(id);
        if (fileInfo == null) {
            throw new BusinessException("文件不存在: " + id);
        }
        return fileInfo;
    }

    private FileInfo findByMd5(String md5) {
        return fileInfoMapper.selectOne(
                new LambdaQueryWrapper<FileInfo>()
                        .eq(FileInfo::getMd5, md5)
                        .last("LIMIT 1"));
    }

    private FileResponse buildFileResponse(FileInfo fileInfo) {
        FileResponse response = new FileResponse();
        response.setId(fileInfo.getId());
        response.setFileName(fileInfo.getFileName());
        response.setOriginalName(fileInfo.getOriginalName());
        response.setFilePath(fileInfo.getFilePath());
        response.setBucket(fileInfo.getBucket());
        response.setContentType(fileInfo.getContentType());
        response.setFileSize(fileInfo.getFileSize());
        response.setMd5(fileInfo.getMd5());
        response.setTenantId(fileInfo.getTenantId());
        response.setUserId(fileInfo.getUserId());
        response.setCreatedAt(fileInfo.getCreatedAt());
        return response;
    }

    private FileResponse buildInstantUploadResponse(FileInfo existingFile) {
        FileResponse response = buildFileResponse(existingFile);
        response.setFileUrl(storageService.getPresignedUrl(existingFile.getBucket(), existingFile.getFilePath(), DEFAULT_EXPIRES));
        return response;
    }
}
