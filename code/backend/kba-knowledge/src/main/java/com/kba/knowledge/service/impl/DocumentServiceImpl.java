package com.kba.knowledge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.kba.common.core.exception.BusinessException;
import com.kba.knowledge.service.DocumentService;
import com.kba.knowledge.entity.Document;
import com.kba.knowledge.mapper.DocumentMapper;
import com.kba.knowledge.mapper.KnowledgeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import com.kba.knowledge.entity.Knowledge;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentMapper documentMapper;
    private final KnowledgeMapper knowledgeMapper;

    @Value("${app.upload.path:./uploads}")
    private String uploadPath;

    @Override
    public Map<String, Object> listPage(int pageNum, int pageSize, Long knowledgeId) {
        Page<Document> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Document> wrapper = new LambdaQueryWrapper<>();
        
        if (knowledgeId != null) {
            wrapper.eq(Document::getKnowledgeId, knowledgeId);
        }
        wrapper.orderByDesc(Document::getCreatedAt);
        
        Page<Document> result = documentMapper.selectPage(page, wrapper);
        
        List<Map<String, Object>> list = result.getRecords().stream()
            .map(this::toMap)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", list);
        response.put("total", result.getTotal());
        response.put("page", pageNum);
        response.put("pageSize", pageSize);
        return response;
    }

    @Override
    public Map<String, Object> getById(Long id) {
        Document document = documentMapper.selectById(id);
        if (document == null) {
            throw new BusinessException(404, "文档不存在");
        }
        return toMap(document);
    }

    @Override
    public void delete(Long id) {
        Document document = documentMapper.selectById(id);
        if (document == null) {
            throw new BusinessException(404, "文档不存在");
        }
        documentMapper.deleteById(id);
    }

    @Override
    public Map<String, Object> upload(Long knowledgeId, MultipartFile file) {
        if (knowledgeMapper.selectById(knowledgeId) == null) {
            throw new BusinessException(404, "知识库不存在");
        }
        
        if (file == null || file.isEmpty()) {
            throw new BusinessException(400, "文件不能为空");
        }
        
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String newFilename = UUID.randomUUID().toString() + "." + extension;
        
        try {
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            
            Path filePath = uploadDir.resolve(newFilename);
            file.transferTo(filePath.toFile());
            
            Document document = new Document();
            document.setName(originalFilename);
            document.setKnowledgeId(knowledgeId);
            document.setType(extension.toLowerCase());
            document.setSize(file.getSize());
            document.setStatus("pending");
            document.setChunkCount(0);
            document.setFilePath(filePath.toString());
            document.setCreatedAt(LocalDateTime.now());
            document.setUpdatedAt(LocalDateTime.now());
            
            documentMapper.insert(document);
            return toMap(document);
        } catch (IOException e) {
            throw new BusinessException(500, "文件上传失败: " + e.getMessage());
        }
    }

    @Override
    public List<Map<String, Object>> listRecent(int limit) {
        LambdaQueryWrapper<Document> wrapper = new LambdaQueryWrapper<>();
        wrapper.isNull(Document::getDeletedAt)
                .orderByDesc(Document::getUpdatedAt)
                .last("LIMIT " + Math.max(1, Math.min(limit, 20)));
        return documentMapper.selectList(wrapper).stream()
                .map(this::toRecentMap)
                .collect(Collectors.toList());
    }

    @Override
    public void process(Long id) {
        Document document = documentMapper.selectById(id);
        if (document == null) {
            throw new BusinessException(404, "文档不存在");
        }
        
        document.setStatus("processing");
        document.setUpdatedAt(LocalDateTime.now());
        documentMapper.updateById(document);
        
        // TODO: 实际的文档处理逻辑（如向量化、分块等）
        // 这里可以调用异步处理服务
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "unknown";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    private Map<String, Object> toMap(Document d) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", d.getId());
        map.put("name", d.getName());
        map.put("knowledgeId", d.getKnowledgeId());
        map.put("type", d.getType());
        map.put("size", d.getSize());
        map.put("status", d.getStatus());
        map.put("chunkCount", d.getChunkCount());
        map.put("createdAt", d.getCreatedAt());
        map.put("updatedAt", d.getUpdatedAt());
        return map;
    }

    private Map<String, Object> toRecentMap(Document d) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", String.valueOf(d.getId()));
        map.put("title", d.getName());
        map.put("type", d.getType());
        map.put("knowledgeId", String.valueOf(d.getKnowledgeId()));
        map.put("knowledgeName", resolveKnowledgeName(d.getKnowledgeId()));
        map.put("updatedAt", formatRelativeTime(d.getUpdatedAt()));
        return map;
    }

    private String resolveKnowledgeName(Long knowledgeId) {
        if (knowledgeId == null) {
            return "";
        }
        Knowledge knowledge = knowledgeMapper.selectById(knowledgeId);
        return knowledge != null ? knowledge.getName() : "";
    }

    private String formatRelativeTime(LocalDateTime time) {
        if (time == null) {
            return "";
        }
        Duration duration = Duration.between(time, LocalDateTime.now());
        long minutes = duration.toMinutes();
        if (minutes < 1) {
            return "刚刚";
        }
        if (minutes < 60) {
            return minutes + "分钟前";
        }
        long hours = duration.toHours();
        if (hours < 24) {
            return hours + "小时前";
        }
        long days = duration.toDays();
        if (days < 7) {
            return days + "天前";
        }
        if (days < 30) {
            return (days / 7) + "周前";
        }
        return time.toLocalDate().toString();
    }
}
