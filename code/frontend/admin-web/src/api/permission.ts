import { get, post, put } from './request'

export interface PermissionNode {
  id: string
  label: string
  children?: PermissionNode[]
}

export interface SecurityLevel {
  id: string
  name: string
  description: string
  color: string
}

export interface PermissionConfig {
  permissions: string[]
  securityLevels: SecurityLevel[]
}

export interface UpdatePermissionsParams {
  roleId: string
  permissionIds: string[]
  securityLevelIds: string[]
}

export interface RolePermissions {
  roleId: string
  roleName: string
  permissions: string[]
  securityLevels: string[]
}

export const permissionApi = {
  getPermissionTree: () => get<PermissionNode[]>('/permissions/tree'),
  
  getSecurityLevels: () => get<SecurityLevel[]>('/permissions/security-levels'),
  
  getRolePermissions: (roleId: string) => get<RolePermissions>(`/permissions/roles/${roleId}`),
  
  updatePermissions: (params: UpdatePermissionsParams) => 
    put<void>('/permissions/roles/update', params),
  
  batchUpdatePermissions: (data: UpdatePermissionsParams[]) =>
    post<void>('/permissions/roles/batch-update', data),
}