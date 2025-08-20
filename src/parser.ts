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
    // 查找变量声明中的 pgTable 调用
    if (ts.isVariableDeclaration(node) && 
        node.initializer &&
        ts.isCallExpression(node.initializer) &&
        ts.isIdentifier(node.initializer.expression) &&
        node.initializer.expression.text === 'pgTable') {
      
      // 获取变量名（schema名称）
      const schemaName = ts.isIdentifier(node.name) ? node.name.text : null
      if (!schemaName) {
        ts.forEachChild(node, visit)
        return
      }
      
      // 获取表名参数（用于调试，但不用于key）
      const tableNameArg = node.initializer.arguments[0]
      if (!ts.isStringLiteral(tableNameArg)) {
        ts.forEachChild(node, visit)
        return
      }
      
      // 获取字段定义对象
      const fieldsArg = node.initializer.arguments[1]
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
        config[schemaName] = tableConfig
      }
    }
    
    ts.forEachChild(node, visit)
  }
  
  visit(sourceFile)
  return config
}

/**
 * 递归查找目录中的所有 .ts 文件
 */
function findTsFiles(dir: string): string[] {
  const files: string[] = []
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        // 递归扫描子目录
        files.push(...findTsFiles(fullPath))
      } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        // 添加 .ts 文件（排除 .d.ts 文件）
        files.push(fullPath)
      }
    }
  } catch (error) {
    console.warn(`警告: 无法读取目录 ${dir}:`, error)
  }
  
  return files
}

/**
 * 解析多个 schema 文件
 */
export function parseSchemaFiles(schemaDir: string): TypeBoxConfig {
  const config: TypeBoxConfig = {}
  
  // 递归查找所有 .ts 文件
  const files = findTsFiles(schemaDir)
  
  console.log(`🔍 找到 ${files.length} 个 TypeScript 文件:`)
  files.forEach(file => console.log(`  - ${file}`))
  
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