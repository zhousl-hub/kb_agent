// utils/reportAdapter.ts
// 请求/响应处理器，统一处理数据转换

import { get, post, put, del } from "@/api/request"
import type { PageResult, PageParams } from "@/types"

const STATUS_MAP: Record<number, string> = {
  0: "draft",
  1: "published",
  2: "archived",
}

const REVERSE_STATUS_MAP: Record<string, number> = {
  draft: 0,
  published: 1,
  archived: 2,
}

const REPORT_FIELDS: Record<string, string> = {
  title: "report_title",
  reportType: "report_type",
  reportFormat: "report_format",
  ownerId: "owner_id",
  spaceId: "space_id",
  createTime: "create_time",
  updateTime: "update_time",
  tenantId: "tenant_id",
  publishStatus: "publish_status",
  aiGenerated: "ai_generated",
  generateStatus: "generate_status",
  publishTime: "publish_time",
  viewCount: "view_count",
  downloadCount: "download_count",
}

export function adaptBackendToReport(backendData: any): any {
  if (!backendData) return backendData

  const adapted: any = {}

  for (const [key, value] of Object.entries(backendData)) {
    let newKey = key
    for (const [frontKey, backKey] of Object.entries(REPORT_FIELDS)) {
      if (backKey === key) {
        newKey = frontKey
        break
      }
    }

    if (
      (key === "publishStatus" || key === "publish_status") &&
      typeof value === "number"
    ) {
      adapted[newKey] = STATUS_MAP[value] || value.toString()
    } else if (
      (key === "status" || key === "publish_status") &&
      typeof value === "number"
    ) {
      adapted[newKey] = STATUS_MAP[value] || value.toString()
    } else {
      adapted[newKey] = value
    }
  }

  if (!adapted.version && adapted.id) {
    adapted.version = 1
  }

  return adapted
}

export function adaptReportToBackend(frontData: any): any {
  if (!frontData) return frontData

  const adapted: any = {}

  for (const [key, value] of Object.entries(frontData)) {
    const backendField = REPORT_FIELDS[key] || key
    let newValue: any = value

    if (
      (key === "publishStatus" || key === "status") &&
      typeof value === "string"
    ) {
      newValue = REVERSE_STATUS_MAP[value] || parseInt(value)
    } else if (key === "ownerId" && typeof value === "number") {
      newValue = value.toString()
    }

    adapted[backendField] = newValue
  }

  return adapted
}

export const reportApi = {
  async getList(params: PageParams): Promise<PageResult<any>> {
    try {
      const response = await get<any>("/v1/reports", params)

      if (response && response.items !== undefined) {
        const adapted = {
          items: response.items.map(adaptBackendToReport),
          total: response.total || response.items?.length || 0,
          page: response.page || 1,
          pageSize: response.pageSize || 10,
        }
        return adapted
      } else if (response && response.list !== undefined) {
        const adapted = {
          items: response.list.map(adaptBackendToReport),
          total: response.total || response.list?.length || 0,
          page: response.pageNum || response.page || 1,
          pageSize: response.pageSize || 10,
        }
        return adapted
      } else {
        const adapted = {
          items: (response || []).map(adaptBackendToReport),
          total: (response || []).length,
          page: 1,
          pageSize: (response || []).length,
        }
        return adapted
      }
    } catch (error) {
      console.error("获取报告列表失败:", error)
      throw error
    }
  },

  async getDetail(id: string): Promise<any> {
    try {
      const response = await get<any>(`/v1/reports/${id}`)
      return adaptBackendToReport(response)
    } catch (error) {
      console.error("获取报告详情失败:", error)
      throw error
    }
  },

  async create(data: any): Promise<any> {
    try {
      const backendData = adaptReportToBackend(data)
      const response = await post<any>("/v1/reports", backendData)
      return adaptBackendToReport(response)
    } catch (error) {
      console.error("创建报告失败:", error)
      throw error
    }
  },

  async update(id: string, data: any): Promise<any> {
    try {
      const backendData = adaptReportToBackend(data)
      const response = await put<any>(`/v1/reports/${id}`, backendData)
      return adaptBackendToReport(response)
    } catch (error) {
      console.error("更新报告失败:", error)
      throw error
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await del<void>(`/v1/reports/${id}`)
    } catch (error) {
      console.error("删除报告失败:", error)
      throw error
    }
  },

  async publish(id: string): Promise<any> {
    try {
      const response = await post<any>(`/v1/reports/${id}/publish`)
      return adaptBackendToReport(response)
    } catch (error) {
      console.error("发布报告失败:", error)
      throw error
    }
  },

  async search(query: string, options?: any): Promise<any> {
    try {
      const response = await post<any>("/v1/reports/search", {
        query,
        ...options,
      })
      return response
    } catch (error) {
      console.error("报告搜索失败:", error)
      throw error
    }
  },

  async getVersions(reportId: string): Promise<any[]> {
    try {
      const response: any[] = await get<any[]>(
        `/v1/reports/${reportId}/versions`
      )
      return response.map(adaptBackendToReport)
    } catch (error) {
      console.error("获取报告版本失败:", error)
      throw error
    }
  },

  async compareVersions(
    reportId: string,
    version1: number,
    version2: number
  ): Promise<any> {
    try {
      const response = await post<any>(
        `/v1/reports/${reportId}/versions/compare`,
        { version1, version2 }
      )
      return response
    } catch (error) {
      console.error("对比版本失败:", error)
      throw error
    }
  },

  async rollback(reportId: string, version: number): Promise<any> {
    try {
      const response = await post<any>(
        `/v1/reports/${reportId}/versions/rollback`,
        { version }
      )
      return adaptBackendToReport(response)
    } catch (error) {
      console.error("回滚版本失败:", error)
      throw error
    }
  },
}