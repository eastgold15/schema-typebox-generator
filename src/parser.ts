import * as ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'

/**
 * JSDoc 解析结果接口
 */
export interface TypeBoxConfig {
  [tableName: string]: {
    insert?: Record<string, any>
    select?: Record<string, any>
  }
}

/**
 * 解析 JSDoc 注释中的 @typebox 配置
 */
function parseTypeBoxComment(comment: string): any {
  const typeboxMatch = comment.match(/@typebox\s*({.*})?/)
  if (!typeboxMatch) return null
  
  const configStr = typeboxMatch[1]
  
  // 如果是简单的配置（如 @typebox），返回空对象
  if (!configStr || !configStr.startsWith('{')) {
    return {}
  }
  
  try {
    // 解析 JSON 配置
    return JSON.parse(configStr)
  } catch (error) {
    console.warn(`Failed to parse @typebox config: ${configStr}`, error)
    return null
  }
}

/**
 * 解析 Drizzle Schema 文件中的 @typebox 注释
 */
export function parseSchemaFile(filePath: string): TypeBoxConfig {
  const sourceCode = fs.readFileSync(filePath, 'utf-8')
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  )
  
  const config: TypeBoxConfig = {}
  
  function visit(node: ts.Node) {
    // 查找 pgTable 调用
    if (ts.isCallExpression(node) && 
        ts.isIdentifier(node.expression) && 
        node.expression.text === 'pgTable') {
      
      // 获取表名
      const tableNameArg = node.arguments[0]
      if (!ts.isStringLiteral(tableNameArg)) {
        ts.forEachChild(node, visit)
        return
      }
      
      const tableName = tableNameArg.text
      
      // 获取字段定义对象
      const fieldsArg = node.arguments[1]
      if (!ts.isObjectLiteralExpression(fieldsArg)) {
        ts.forEachChild(node, visit)
        return
      }
      
      const tableConfig: { insert?: Record<string, any>, select?: Record<string, any> } = {
        insert: {},
        select: {}
      }
      
      // 遍历字段定义
      for (const property of fieldsArg.properties) {
        if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name)) {
          continue
        }
        
        const fieldName = property.name.text
        
        // 获取完整的行文本
        const lineNumber = sourceFile.getLineAndCharacterOfPosition(property.getStart()).line
        const lines = sourceFile.text.split('\n')
        const lineText = lines[lineNumber]
         
        // 查找行内注释
        const commentMatch = lineText.match(/\/\/\s*(.*)$/)
        if (commentMatch) {
          const commentText = commentMatch[1].trim()
           
          const typeboxConfig = parseTypeBoxComment(commentText)
           
          if (typeboxConfig !== null) {
            // 默认同时应用于 insert 和 select
            tableConfig.insert![fieldName] = typeboxConfig
            tableConfig.select![fieldName] = typeboxConfig
          }
        }
      }
      
      // 只有当有配置时才添加到结果中
      if (Object.keys(tableConfig.insert!).length > 0 || Object.keys(tableConfig.select!).length > 0) {
        config[tableName + 'Schema'] = tableConfig
      }
    }
    
    ts.forEachChild(node, visit)
  }
  
  visit(sourceFile)
  return config
}

/**
 * 解析多个 schema 文件
 */
export function parseSchemaFiles(schemaDir: string): TypeBoxConfig {
  const config: TypeBoxConfig = {}
  
  // 查找所有 .ts 文件
  const files = fs.readdirSync(schemaDir)
    .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
    .map(file => path.join(schemaDir, file))
  
  for (const file of files) {
    const fileConfig = parseSchemaFile(file)
    Object.assign(config, fileConfig)
  }
  
  return config
}

/**
 * 生成 TypeBox 导入语句
 */
export function generateTypeBoxImports(config: TypeBoxConfig): string {
  const usedTypes = new Set<string>()
  
  // 分析使用的 TypeBox 类型
  for (const tableConfig of Object.values(config)) {
    for (const modeConfig of [tableConfig.insert, tableConfig.select]) {
      if (!modeConfig) continue
      
      for (const fieldConfig of Object.values(modeConfig)) {
        if (typeof fieldConfig === 'object' && fieldConfig !== null) {
          // 根据配置推断需要的 TypeBox 类型
          if ('format' in fieldConfig) usedTypes.add('String')
          if ('minLength' in fieldConfig || 'maxLength' in fieldConfig) usedTypes.add('String')
          if ('minimum' in fieldConfig || 'maximum' in fieldConfig) usedTypes.add('Number')
          if ('default' in fieldConfig) {
            // 根据默认值类型推断
            const defaultValue = fieldConfig.default
            if (typeof defaultValue === 'string') usedTypes.add('String')
            if (typeof defaultValue === 'number') usedTypes.add('Number')
            if (typeof defaultValue === 'boolean') usedTypes.add('Boolean')
          }
        }
      }
    }
  }
  
  if (usedTypes.size === 0) return ''
  
  return `import { t } from 'elysia'`
}