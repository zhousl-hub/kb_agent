package com.kba.file.controller;

import com.kba.file.dto.FileUploadRequest;
import com.kba.file.dto.FileResponse;
import com.kba.file.service.FileService;
import com.kba.common.core.result.R;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 文件控制器
 *
 * @author kba
 */
@Tag(name = "文件管理")
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @Operation(summary = "上传文件")
    @PostMapping("/upload")
    public R<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String bucket,
            @RequestParam(required = false) String path) {
        return R.ok(fileService.uploadFile(file, bucket, path));
    }

    @Operation(summary = "批量上传文件")
    @PostMapping("/batch-upload")
    public R<List<FileResponse>> batchUploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(required = false) String bucket,
            @RequestParam(required = false) String path) {
        return R.ok(fileService.batchUploadFiles(files, bucket, path));
    }

    @Operation(summary = "下载文件")
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        return fileService.downloadFile(id);
    }

    @Operation(summary = "预览文件")
    @GetMapping("/preview/{id}")
    public ResponseEntity<Resource> previewFile(@PathVariable Long id) {
        return fileService.previewFile(id);
    }

    @Operation(summary = "获取文件信息")
    @GetMapping("/{id}")
    public R<FileResponse> getFileInfo(@PathVariable Long id) {
        return R.ok(fileService.getFileInfo(id));
    }

    @Operation(summary = "获取文件列表")
    @GetMapping
    public R<Map<String, Object>> listFiles(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String bucket,
            @RequestParam(required = false) String path,
            @RequestParam(required = false) String fileType) {
        return R.ok(fileService.listFiles(pageNum, pageSize, bucket, path, fileType));
    }

    @Operation(summary = "删除文件")
    @DeleteMapping("/{id}")
    public R<Void> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return R.ok();
    }

    @Operation(summary = "批量删除文件")
    @DeleteMapping("/batch")
    public R<Void> batchDeleteFiles(@RequestBody List<Long> ids) {
        fileService.batchDeleteFiles(ids);
        return R.ok();
    }

    @Operation(summary = "获取文件访问URL")
    @GetMapping("/{id}/url")
    public R<String> getFileUrl(@PathVariable Long id, @RequestParam(defaultValue = "3600") long expires) {
        return R.ok(fileService.getFileUrl(id, expires));
    }

    @Operation(summary = "复制文件")
    @PostMapping("/{id}/copy")
    public R<FileResponse> copyFile(@PathVariable Long id, @RequestParam String targetPath) {
        return R.ok(fileService.copyFile(id, targetPath));
    }

    @Operation(summary = "移动文件")
    @PostMapping("/{id}/move")
    public R<Void> moveFile(@PathVariable Long id, @RequestParam String targetPath) {
        fileService.moveFile(id, targetPath);
        return R.ok();
    }

    @Operation(summary = "重命名文件")
    @PostMapping("/{id}/rename")
    public R<Void> renameFile(@PathVariable Long id, @RequestParam String newName) {
        fileService.renameFile(id, newName);
        return R.ok();
    }
}
