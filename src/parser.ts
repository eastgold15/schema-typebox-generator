import { parse } from '@babel/parser';
import * as t from '@babel/types';
import * as fs from 'fs';
import * as path from 'path';
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
 * 字段注释信息接口
 */
export interface FieldCommentInfo {
  comment: string         // 普通注释内容
  typeboxConfig: any      // @typebox 配置
}

/**
 * 表字段信息接口
 */
export interface TableFieldsInfo {
  [fieldName: string]: FieldCommentInfo
}

/**
 * 解析字段注释，提取普通注释和@typebox配置
 */
function parseFieldComment(commentText: string): FieldCommentInfo {
  const result: FieldCommentInfo = {
    comment: '',
    typeboxConfig: null
  }

  // 提取@typebox配置
  const typeboxConfig = parseTypeBoxComment(commentText)
  if (typeboxConfig !== null) {
    result.typeboxConfig = typeboxConfig
  }

  // 提取普通注释（去除@typebox部分）
  let cleanComment = commentText
    .replace(/@typebox\s*{[^}]*}/g, '') // 移除@typebox配置
    .replace(/\/\*\*?|\*\/|\/\/|\*/g, '') // 移除注释符号
    .trim()

  result.comment = cleanComment
  return result
}

/**
 * 解析 @typebox 注释配置
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
 * 根据换行符解析pgTable字段的注释
 */
function parseTableFieldComments(sourceCode: string, fieldsObjectStart: number, fieldsObjectEnd: number): TableFieldsInfo {
  const result: TableFieldsInfo = {}

  // 提取字段对象的代码片段
  const fieldsCode = sourceCode.substring(fieldsObjectStart, fieldsObjectEnd)
  const lines = fieldsCode.split('\n')

  let currentFieldName = ''
  let currentComments: string[] = []

  for (let i = 0;i < lines.length;i++) {
    const line = lines[i].trim()

    // 跳过空行和只有符号的行
    if (!line || line === '{' || line === '}' || line === ',' || line.startsWith('(')) {
      continue
    }

    // 检查是否是注释行
    if (line.startsWith('/**') || line.startsWith('/*') || line.startsWith('*') || line.startsWith('//')) {
      // 收集注释
      currentComments.push(line)
      continue
    }

    // 检查是否是字段定义行
    const fieldMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:/)
    if (fieldMatch) {
      const fieldName = fieldMatch[1]

      // 处理之前收集的注释
      if (currentComments.length > 0) {
        const commentText = currentComments.join('\n')
        result[fieldName] = parseFieldComment(commentText)
        currentComments = []
      }

      // 检查同行是否有注释
      const inlineCommentMatch = line.match(/\/\/(.*)$/)
      if (inlineCommentMatch) {
        const inlineComment = inlineCommentMatch[1].trim()
        if (result[fieldName]) {
          // 合并注释
          const existingComment = result[fieldName].comment
          result[fieldName].comment = existingComment ? `${existingComment} ${inlineComment}` : inlineComment

          // 检查内联注释中的@typebox
          const inlineTypeboxConfig = parseTypeBoxComment(inlineComment)
          if (inlineTypeboxConfig !== null) {
            result[fieldName].typeboxConfig = inlineTypeboxConfig
          }
        } else {
          result[fieldName] = parseFieldComment(inlineComment)
        }
      }

      // 如果字段没有任何注释，创建空的注释信息
      if (!result[fieldName]) {
        result[fieldName] = {
          comment: '',
          typeboxConfig: null
        }
      }

      currentFieldName = fieldName
    }
  }

  return result
}

/**
 * 解析schema文件并返回完整的字段注释信息
 */
export async function parseSchemaFileWithComments(filePath: string): Promise<{ [tableName: string]: TableFieldsInfo }> {
  const sourceCode = fs.readFileSync(filePath, 'utf-8')
  const result: { [tableName: string]: TableFieldsInfo } = {}

  try {
    const ast = parse(sourceCode, {
      sourceType: 'module',
      plugins: ['typescript', 'decorators-legacy'],
    })

    // 动态导入 traverse
    const traverseModule = await import('@babel/traverse')
    const traverse = traverseModule.default || traverseModule

    traverse(ast, {
      VariableDeclarator(path) {
        const node = path.node

        // 检查是否是 pgTable 调用
        if (t.isCallExpression(node.init) &&
          t.isIdentifier(node.init.callee) &&
          node.init.callee.name === 'pgTable' &&
          t.isIdentifier(node.id)) {

          const schemaName = node.id.name

          // 获取字段定义对象（第二个参数）
          const fieldsArg = node.init.arguments[1]
          if (t.isObjectExpression(fieldsArg)) {

            // 获取字段对象在源码中的位置
            const fieldsStart = fieldsArg.start || 0
            const fieldsEnd = fieldsArg.end || 0

            // 使用基于换行符的注释解析方法
            const fieldsInfo = parseTableFieldComments(sourceCode, fieldsStart, fieldsEnd)

            result[schemaName] = fieldsInfo
          }
        }
      }
    })
  } catch (error) {
    console.warn(`解析文件 ${filePath} 时出错:`, error)
  }

  return result
}

/**
 * 解析多个schema文件并返回完整的字段注释信息
 */
export async function parseSchemaFilesWithComments(schemaDir: string): Promise<{ [tableName: string]: TableFieldsInfo }> {
  const result: { [tableName: string]: TableFieldsInfo } = {}

  try {
    const tsFiles = findTsFiles(schemaDir)
    console.log(`🔍 找到 ${tsFiles.length} 个 TypeScript 文件:`)

    for (const file of tsFiles) {
      console.log(`  - ${file}`)
      const fileResult = await parseSchemaFileWithComments(file)
      Object.assign(result, fileResult)
    }
  } catch (error) {
    console.warn('解析schema文件时出错:', error)
  }

  return result
}

/**
 * 解析 Drizzle Schema 文件中的 @typebox 注释
 */
export async function parseSchemaFile(filePath: string): Promise<TypeBoxConfig> {
  const sourceCode = fs.readFileSync(filePath, 'utf-8')
  const config: TypeBoxConfig = {}

  try {
    const ast = parse(sourceCode, {
      sourceType: 'module',
      plugins: ['typescript', 'decorators-legacy'],
    })

    // 动态导入 traverse
    const traverseModule = await import('@babel/traverse')
    const traverse = traverseModule.default || traverseModule

    traverse(ast, {
      VariableDeclarator(path) {
        const node = path.node

        // 检查是否是 pgTable 调用
        if (t.isCallExpression(node.init) &&
          t.isIdentifier(node.init.callee) &&
          node.init.callee.name === 'pgTable' &&
          t.isIdentifier(node.id)) {

          const schemaName = node.id.name
          const tableConfig: { insert?: Record<string, any>, select?: Record<string, any> } = {
            insert: {},
            select: {}
          }

          // 获取字段定义对象（第二个参数）
          const fieldsArg = node.init.arguments[1]
          if (t.isObjectExpression(fieldsArg)) {

            // 获取字段对象在源码中的位置
            const fieldsStart = fieldsArg.start || 0
            const fieldsEnd = fieldsArg.end || 0

            // 使用新的基于换行符的注释解析方法
            const fieldsInfo = parseTableFieldComments(sourceCode, fieldsStart, fieldsEnd)

            // 遍历解析出的字段信息
            for (const [fieldName, fieldInfo] of Object.entries(fieldsInfo)) {
              // 如果字段有@typebox配置，添加到结果中
              if (fieldInfo.typeboxConfig !== null) {
                // 默认同时应用于 insert 和 select
                tableConfig.insert![fieldName] = fieldInfo.typeboxConfig
                tableConfig.select![fieldName] = fieldInfo.typeboxConfig
              }
            }
          }

          // 始终添加 schema 到结果中，即使没有 @typebox 配置
          config[schemaName] = tableConfig
        }
      }
    })
  } catch (error) {
    console.warn(`解析文件 ${filePath} 时出错:`, error)
  }

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
export async function parseSchemaFiles(schemaDir: string): Promise<TypeBoxConfig> {
  const config: TypeBoxConfig = {}

  // 递归查找所有 .ts 文件
  const files = findTsFiles(schemaDir)

  console.log(`🔍 找到 ${files.length} 个 TypeScript 文件:`)
  files.forEach(file => console.log(`  - ${file}`))

  for (const file of files) {
    const fileConfig = await parseSchemaFile(file)
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