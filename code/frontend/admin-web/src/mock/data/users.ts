import type { UserInfo, RoleInfo, MenuInfo } from '@/types/user'

export const mockUsers: UserInfo[] = [
  {
    id: 'user-admin-001',
    username: 'admin',
    nickname: '系统管理员',
    email: 'admin@kba.com',
    phone: '13800138000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    departmentId: 'dept-001',
    departmentName: '技术部',
    roles: ['admin'],
    tenantId: 'tenant-001',
    tenantName: '默认租户',
    status: 1,
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2025-03-10T08:00:00Z',
  },
  {
    id: 'user-zhangsan-001',
    username: 'zhangsan',
    nickname: '张三',
    email: 'zhangsan@kba.com',
    phone: '13800138001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    departmentId: 'dept-001',
    departmentName: '技术部',
    roles: ['user'],
    tenantId: 'tenant-001',
    tenantName: '默认租户',
    status: 1,
    createdAt: '2024-02-15T00:00:00Z',
    lastLoginAt: '2025-03-09T15:30:00Z',
  },
  {
    id: 'user-lisi-001',
    username: 'lisi',
    nickname: '李四',
    email: 'lisi@kba.com',
    phone: '13800138002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    departmentId: 'dept-002',
    departmentName: '产品部',
    roles: ['user'],
    tenantId: 'tenant-001',
    tenantName: '默认租户',
    status: 1,
    createdAt: '2024-03-01T00:00:00Z',
    lastLoginAt: '2025-03-08T10:00:00Z',
  },
  {
    id: 'user-wangwu-001',
    username: 'wangwu',
    nickname: '王五',
    email: 'wangwu@kba.com',
    phone: '13800138003',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    departmentId: 'dept-001',
    departmentName: '技术部',
    roles: ['manager'],
    tenantId: 'tenant-001',
    tenantName: '默认租户',
    status: 1,
    createdAt: '2024-01-15T00:00:00Z',
    lastLoginAt: '2025-03-10T07:45:00Z',
  },
]

export const mockRoles: RoleInfo[] = [
  {
    id: 'role-admin',
    name: '系统管理员',
    code: 'admin',
    description: '拥有系统所有权限',
    permissions: ['*'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-manager',
    name: '部门经理',
    code: 'manager',
    description: '管理本部门资源和用户',
    permissions: [
      'knowledge:read', 'knowledge:write',
      'document:read', 'document:write',
      'model:read',
      'user:read',
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-user',
    name: '普通用户',
    code: 'user',
    description: '基本访问权限',
    permissions: [
      'knowledge:read',
      'document:read',
      'model:read',
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

export const mockMenus: MenuInfo[] = [
  {
    id: 'menu-dashboard',
    parentId: null,
    name: '仪表盘',
    path: '/dashboard',
    icon: 'Odometer',
    sort: 1,
    visible: true,
  },
  {
    id: 'menu-knowledge',
    parentId: null,
    name: '知识管理',
    path: '/knowledge',
    icon: 'Collection',
    sort: 2,
    visible: true,
    children: [
      {
        id: 'menu-knowledge-space',
        parentId: 'menu-knowledge',
        name: '知识空间',
        path: '/knowledge/space',
        icon: 'FolderOpened',
        sort: 1,
        visible: true,
      },
      {
        id: 'menu-knowledge-ingestion',
        parentId: 'menu-knowledge',
        name: '数据接入',
        path: '/knowledge/ingestion',
        icon: 'Upload',
        sort: 2,
        visible: true,
      },
      {
        id: 'menu-knowledge-processing',
        parentId: 'menu-knowledge',
        name: '数据处理',
        path: '/knowledge/processing',
        icon: 'Setting',
        sort: 3,
        visible: true,
      },
      {
        id: 'menu-knowledge-retrieval',
        parentId: 'menu-knowledge',
        name: '检索测试',
        path: '/knowledge/retrieval',
        icon: 'Search',
        sort: 4,
        visible: true,
      },
    ],
  },
  {
    id: 'menu-model',
    parentId: null,
    name: '模型管理',
    path: '/model',
    icon: 'Cpu',
    sort: 3,
    visible: true,
    children: [
      {
        id: 'menu-model-provider',
        parentId: 'menu-model',
        name: '模型供应商',
        path: '/model/provider',
        icon: 'Connection',
        sort: 1,
        visible: true,
      },
      {
        id: 'menu-model-router',
        parentId: 'menu-model',
        name: '模型路由',
        path: '/model/router',
        icon: 'Guide',
        sort: 2,
        visible: true,
      },
    ],
  },
  {
    id: 'menu-dify',
    parentId: null,
    name: 'Dify应用',
    path: '/dify',
    icon: 'Box',
    sort: 4,
    visible: true,
    children: [
      {
        id: 'menu-dify-app',
        parentId: 'menu-dify',
        name: '应用管理',
        path: '/dify/app',
        icon: 'Grid',
        sort: 1,
        visible: true,
      },
    ],
  },
  {
    id: 'menu-auth',
    parentId: null,
    name: '权限管理',
    path: '/auth',
    icon: 'Lock',
    sort: 5,
    visible: true,
    children: [
      {
        id: 'menu-auth-user',
        parentId: 'menu-auth',
        name: '用户管理',
        path: '/auth/user',
        icon: 'User',
        sort: 1,
        visible: true,
      },
      {
        id: 'menu-auth-role',
        parentId: 'menu-auth',
        name: '角色管理',
        path: '/auth/role',
        icon: 'UserFilled',
        sort: 2,
        visible: true,
      },
    ],
  },
  {
    id: 'menu-governance',
    parentId: null,
    name: '治理中心',
    path: '/governance',
    icon: 'Shield',
    sort: 6,
    visible: true,
    children: [
      {
        id: 'menu-governance-permission',
        parentId: 'menu-governance',
        name: '权限配置',
        path: '/governance/permission',
        icon: 'Key',
        sort: 1,
        visible: true,
      },
      {
        id: 'menu-governance-audit',
        parentId: 'menu-governance',
        name: '审计日志',
        path: '/governance/audit',
        icon: 'View',
        sort: 2,
        visible: true,
      },
    ],
  },
  {
    id: 'menu-monitor',
    parentId: null,
    name: '监控中心',
    path: '/monitor',
    icon: 'Monitor',
    sort: 7,
    visible: true,
    children: [
      {
        id: 'menu-monitor-dashboard',
        parentId: 'menu-monitor',
        name: '运行监控',
        path: '/monitor/dashboard',
        icon: 'DataLine',
        sort: 1,
        visible: true,
      },
      {
        id: 'menu-monitor-feedback',
        parentId: 'menu-monitor',
        name: '用户反馈',
        path: '/monitor/feedback',
        icon: 'ChatDotSquare',
        sort: 2,
        visible: true,
      },
    ],
  },
  {
    id: 'menu-system',
    parentId: null,
    name: '系统设置',
    path: '/system',
    icon: 'Setting',
    sort: 8,
    visible: true,
    children: [
      {
        id: 'menu-system-config',
        parentId: 'menu-system',
        name: '系统配置',
        path: '/system/config',
        icon: 'Tools',
        sort: 1,
        visible: true,
      },
    ],
  },
]

export const mockPermissions: string[] = [
  'knowledge:read', 'knowledge:write', 'knowledge:delete',
  'document:read', 'document:write', 'document:delete',
  'model:read', 'model:write', 'model:delete',
  'user:read', 'user:write', 'user:delete',
  'role:read', 'role:write', 'role:delete',
  'system:config',
]

export const userPasswords: Record<string, string> = {
  admin: 'Admin@123',
  zhangsan: 'User@123',
  lisi: 'User@123',
  wangwu: 'Manager@123',
}

export function findUserByUsername(username: string): UserInfo | undefined {
  return mockUsers.find(u => u.username === username)
}

export function validatePassword(username: string, password: string): boolean {
  return userPasswords[username] === password
}

export function getUserPermissions(username: string): string[] {
  const user = findUserByUsername(username)
  if (!user) return []
  
  if (user.roles.includes('admin')) {
    return ['*']
  }
  
  const permissions: string[] = []
  user.roles.forEach(roleCode => {
    const role = mockRoles.find(r => r.code === roleCode)
    if (role) {
      permissions.push(...role.permissions)
    }
  })
  
  return [...new Set(permissions)]
}