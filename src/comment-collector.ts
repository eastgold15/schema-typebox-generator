import * as fs from 'fs'
import * as path from 'path'
import { type SchemaCollectorConfig } from './schema-collector.js'

/**
 * 注释收集结果接口
 */
export interface CommentCollectionResult {
  /** 表名到字段注释的映射 */
  tableComments: Record<string, Record<string, string>>
  /** 表名到@typebox配置的映射 */
  typeboxConfigs: Record<string, Record<string, any>>
}

/**
 * 注释收集器配置接口
 */
export interface CommentCollectorConfig {
  /** 数据库文件夹路径 */
  dbDir: string
  /** 输出文件名（相对于dbDir/sdb/） */
  outputFileName?: string
  /** Schema 导入路径 */
  schemaImportPath?: string
  /** 插件导入路径 */
  pluginImportPath?: string
  /** Schema 收集器配置 */
  schemaConfig?: Partial<SchemaCollectorConfig>
}

/**
 * 解析 JSDoc 注释中的 @typebox 配置
 */
export function parseTypeBoxComment(comment: string): any {
  const typeboxMatch = comment.match(/@typebox\s*({.*})?/)
  if (!typeboxMatch) return null
  
  const configStr = typeboxMatch[1]
  
  // 如果是简单的配置（如 @typebox），返回空对象
  if (!configStr || !configStr.startsWith('{')) {
    return {}
  }
  
  try {
    // 将单引号转换为双引号以支持更灵活的 JSON 格式
    const normalizedConfigStr = configStr
      .replace(/'/g, '"')  // 将单引号替换为双引号
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')  // 为属性名添加双引号
    
    // 解析 JSON 配置
    return JSON.parse(normalizedConfigStr)
  } catch (error) {
    console.warn(`Failed to parse @typebox config: ${configStr}`, error)
    return null
  }
}

/**
 * 提取注释文本（去除@typebox部分）
 */
export function extractCommentText(comment: string): string {
  // 移除 @typebox 配置部分，保留普通注释
  return comment
    .replace(/@typebox\s*({.*})?/g, '') // 移除@typebox配置
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim()
}