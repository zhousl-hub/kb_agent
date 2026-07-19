/**
 * 简单的文本差异计算工具
 */

export interface DiffResult {
  added: string[];
  removed: string[];
  modified: string[];
  summary: string;
}

/**
 * 比较两个文本的内容差异
 */
export function calculateTextDiff(text1: string, text2: string): DiffResult {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  
  const maxLength = Math.max(lines1.length, lines2.length);
  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];
  
  for (let i = 0; i < maxLength; i++) {
    const line1 = lines1[i];
    const line2 = lines2[i];
    
    if (line1 === undefined) {
      // 新增行
      added.push(`+ ${line2}`);
    } else if (line2 === undefined) {
      // 删除行
      removed.push(`- ${line1}`);
    } else if (line1 !== line2) {
      // 修改行
      modified.push(`- ${line1}`, `+ ${line2}`);
    }
  }
  
  let summary = '';
  if (added.length > 0) summary += `添加了 ${added.length} 行\n`;
  if (removed.length > 0) summary += `删除了 ${removed.length} 行\n`;
  if (modified.length > 0) summary += `修改了 ${modified.length/2} 行`;
  
  if (!summary) summary = '两个版本内容完全相同';
  
  return {
    added,
    removed,
    modified,
    summary
  };
}

/**
 * 将差异结果格式化为字符串
 */
export function formatDiffResult(diff: DiffResult): string {
  let result = '';
  if (diff.summary) result += `差异概览：\n${diff.summary}\n\n`;
  
  if (diff.added.length > 0) {
    result += `新增内容：\n${diff.added.join('\n')}\n\n`;
  }
  
  if (diff.removed.length > 0) {
    result += `删除内容：\n${diff.removed.join('\n')}\n\n`;
  }
  
  if (diff.modified.length > 0) {
    result += `修改内容：\n${diff.modified.join('\n')}\n\n`;
  }
  
  return result.trim();
}