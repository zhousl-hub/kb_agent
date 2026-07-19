import { reportApi as originalReportApi } from '@/api/report'
import { mapBackendReportToFrontend, mapBackendVersionToFrontend, mapFrontendReportToBackend } from '@/utils/reportMapper'
import type { Report, ReportVersion } from '@/types'

// 将装原报告API，统一处理字段映射问题

export const reportApi = {
  // 获取报告列表
  getList: async (params: any): Promise<{items: Report[], total: number, page: number, pageSize: number}> => {
    try {
      const response: any = await (originalReportApi as any).getList(params)
      
      // 如果后端返回分页格式
      if (response.items) {
        return {
          items: response.items.map(mapBackendReportToFrontend),
          total: response.total || response.items.length,
          page: response.page || 1,
          pageSize: response.pageSize || 10
        }
      } 
      // 如果后端返回 list 格
      else if (response.list) {
        return {
          items: response.list.map(mapBackendReportToFrontend),
          total: response.total || response.list.length,
          page: response.pageNum || response.page || 1,
          pageSize: response.pageSize || 10
        }
      }
      // 如果直接返回数组
      else {
        return {
          items: response.map(mapBackendReportToFrontend),
          total: response.length,
          page: 1,
          pageSize: response.length
        }
      }
    } catch (error) {
      console.error('获取报告列表失败:', error)
      throw error
    }
  },
  
  // 获取报告详情
  getDetail: async (id: string): Promise<Report> => {
    try {
      const response: any = await (originalReportApi as any).getDetail(id)
      return mapBackendReportToFrontend(response)
    } catch (error) {
      console.error('获取报告详情失败:', error)
      throw error
    }
  },
  
  // 创建报告
  create: async (data: Partial<Report>): Promise<Report> => {
    try {
      // 将装数据以匹配后端格式
      const backendData = mapFrontendReportToBackend(data as Report)
      const response: any = await (originalReportApi as any).create(backendData)
      return mapBackendReportToFrontend(response)
    } catch (error) {
      console.error('创建报告失败:', error)
      throw error
    }
  },
  
  // 更新报告
  update: async (id: string, data: Partial<Report>): Promise<Report> => {
    try {
      const backendData = mapFrontendReportToBackend(data as Report)
      const response: any = await (originalReportApi as any).update(id, backendData)
      return mapBackendReportToFrontend(response)
    } catch (error) {
      console.error('更新报告失败:', error)
      throw error
    }
  },
  
  // 删除报告
  delete: async (id: string): Promise<void> => {
    try {
      await (originalReportApi as any).delete(id)
    } catch (error) {
      console.error('删除报告失败:', error)
      throw error
    }
  },
  
  // 发布报告
  publish: async (id: string): Promise<Report> => {
    try {
      const response: any = await (originalReportApi as any).publish(id)
      return mapBackendReportToFrontend(response)
    } catch (error) {
      console.error('发布报告失败:', error)
      throw error
    }
  },
  
  // 搜索
  search: async (query: string, options?: any) => {
    try {
      const response: any = await (originalReportApi as any).search(query, options)
      return response
    } catch (error) {
      console.error('报告搜索失败:', error)
      throw error
    }
  },
  
  // 获取版本列表
  getVersions: async (reportId: string): Promise<ReportVersion[]> => {
    try {
      const response: any = await (originalReportApi as any).getVersions(reportId)
      // 确保返回的是数组,并进行映射
      if (Array.isArray(response)) {
        return response.map(mapBackendVersionToFrontend)
      }
      return []
    } catch (error) {
      console.error('获取报告版本失败:', error)
      throw error
    }
  },
  
  // 对比版本
  compareVersions: async (reportId: string, version1: number, version2: number) => {
    try {
      const response: any = await (originalReportApi as any).compareVersions(reportId, version1, version2)
      return response
    } catch (error) {
      console.error('对比版本失败:', error)
      throw error
    }
  },
  
  // 回滚版本
  rollback: async (reportId: string, version: number) => {
    try {
      const response: any = await (originalReportApi as any).rollback(reportId, version)
      return mapBackendReportToFrontend(response)
    } catch (error) {
      console.error('.rollback 版本失败:', error)
      throw error
    }
  },
}