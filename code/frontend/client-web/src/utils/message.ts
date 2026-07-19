import { ElMessage } from 'element-plus'

// 确保Element Plus组件在运行时可用
export const message = {
  success: (msg: string) => ElMessage.success(msg),
  warning: (msg: string) => ElMessage.warning(msg),
  error: (msg: string) => ElMessage.error(msg),
  info: (msg: string) => ElMessage.info(msg)
}