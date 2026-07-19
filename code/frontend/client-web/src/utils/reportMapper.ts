/**
 * 将成统一的报告数据类型转换工具
 */

// 后端API返回的数据类型 (直接对应数据库)
interface BackendReport {
  id: string
  tenant_id: string
  space_id: string
  report_title: string
  report_type: string
  report_format: string
  content: string
  ai_generated: boolean
  generate_status: number
  publish_status: number
  publish_time?: string
  view_count: number
  download_count: number
  owner_id: string
  status: number
  create_time: string
  update_time: string
}

// 后端版本数据类型
interface BackendReportVersion {
  id: string
  tenant_id: string
  report_id: string
  version_number: number
  version_name: string
  content: string
  change_summary: string
  file_path: string
  file_size: number
  create_by: string
  create_time: string
  status?: number
}

// 前端使用的报告类型 
export interface FrontendReport {
  id: string
  tenantId: string
  spaceId: string
  title: string          // 映射自 report_title
  reportType: string     // 映射自 report_type
  reportFormat: string   // 映射自 report_format
  content: string
  aiGenerated: boolean   // 映射自 ai_generated
  generateStatus: string // 数字转字符串
  publishStatus: string  // 数字转字符串
  publishTime?: string   // 映射自 publish_time
  viewCount: number
  downloadCount: number
  ownerId: string        // 映射自 owner_id
  status: number         // 保持不变
  createTime: string     // 映射自 create_time
  updateTime: string     // 映射自 update_time
  version: number      // 从最新版本获取
  authorName?: string    // 从用户信息获取
}

// 前端版本类型
export interface FrontendReportVersion {
  id: string
  reportId: string       // 映射自 report_id
  version: number        // 映射自 version_number
  title?: string         // 映射自 version_name
  content: string
  changeSummary?: string // 映射自 change_summary
  createdBy: string      // 映射自 create_by
  createdByName?: string // 从用户信息获取
  createdAt: string      // 映射自 create_time
  status?: number
}

/**
 * 后端报告数据转前端格式
 */
export const mapBackendReportToFrontend = (backendReport: BackendReport): FrontendReport => {
  return {
    id: backendReport.id,
    tenantId: backendReport.tenant_id,
    spaceId: backendReport.space_id,
    title: backendReport.report_title,
    reportType: backendReport.report_type,
    reportFormat: backendReport.report_format,
    content: backendReport.content,
    aiGenerated: backendReport.ai_generated,
    generateStatus: backendReport.generate_status.toString(),
    publishStatus: backendReport.publish_status.toString(),
    publishTime: backendReport.publish_time,
    viewCount: backendReport.view_count,
    downloadCount: backendReport.download_count,
    ownerId: backendReport.owner_id,
    status: backendReport.status,
    createTime: backendReport.create_time,
    updateTime: backendReport.update_time,
    version: 1, // 这里需要从实际版本中获取，简化处理
    authorName: '' // 后续从用户服务获取
  }
}

/**
 * 后端版本数据转前端格式
 */
export const mapBackendVersionToFrontend = (backendVersion: BackendReportVersion): FrontendReportVersion => {
  return {
    id: backendVersion.id,
    reportId: backendVersion.report_id,
    version: backendVersion.version_number,
    title: backendVersion.version_name,
    content: backendVersion.content,
    changeSummary: backendVersion.change_summary,
    createdBy: backendVersion.create_by,
    createdAt: backendVersion.create_time,
    status: backendVersion.status
  }
}

/**
 * 前端报告数据转后端格式
 */
export const mapFrontendReportToBackend = (frontendReport: Partial<FrontendReport>): Partial<BackendReport> => {
  return {
    id: frontendReport.id,
    tenant_id: frontendReport.tenantId,
    space_id: frontendReport.spaceId,
    report_title: frontendReport.title,
    report_type: frontendReport.reportType,
    report_format: frontendReport.reportFormat,
    content: frontendReport.content,
    ai_generated: frontendReport.aiGenerated,
    generate_status: parseInt(frontendReport.generateStatus || '0'),
    publish_status: parseInt(frontendReport.publishStatus || '0'),
    publish_time: frontendReport.publishTime,
    view_count: frontendReport.viewCount,
    download_count: frontendReport.downloadCount,
    owner_id: frontendReport.ownerId,
    status: frontendReport.status,
    create_time: frontendReport.createTime,
    update_time: frontendReport.updateTime,
  }
}

/**
 * 将计报告状态映射
 */
export const getReportStatusText = (statusValue: string | number): string => {
  const numStatus = typeof statusValue === 'string' ? parseInt(statusValue) : statusValue
  
  switch(numStatus) {
    case 0: return '草稿'
    case 1: return '已发布'
    case 2: return '已归档'
    default: return '未知'
  }
}

/**
 * 版本状态映射
 */
export const getVersionStatusText = (statusValue: number): string => {
  switch(statusValue) {
    case 0: return '初始版本'
    case 1: return '中间版本'
    case 2: return '最新版本'
    default: return '特殊版本'
  }
}