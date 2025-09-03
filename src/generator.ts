import * as fs from 'fs'
import { TypeBoxConfig, generateTypeBoxImports, parseSchemaFiles } from './parser.js'
import { SchemaCollector, createSchemaCollector, type SchemaCollectorConfig } from './schema-collector.js'

/**
 * 生成器配置接口
 */
export interface GeneratorConfig {
  /** 数据库文件夹路径 */
  dbDir: string
  /** 输出文件名（相对于dbDir/sdb/） */
  outputFileName?: string
  /** 手动配置覆盖 */
  manualConfig?: Record<string, any>
  /** 是否包含 Elysia 相关代码 */
  includeElysia?: boolean
  /** spreads 导入路径 */
  spreadsImport?: string
  /** dbSchema 和 tableNames 导入路径 */
  schemaImport?: string
  /** Schema 收集器配置 */
  schemaConfig?: Partial<SchemaCollectorConfig>
}

/**
 * 格式化对象为JavaScript对象字面量字符串（不带引号的属性名）
 */
function formatObjectLiteral(obj: any): string {
  if (obj === null || obj === undefined) return 'null'
  if (typeof obj === 'string') return `"${obj}"`
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  
  if (Array.isArray(obj)) {
    return `[${obj.map(formatObjectLiteral).join(', ')}]`
  }
  
  if (typeof obj === 'object') {
    const entries = Object.entries(obj)
      .map(([key, value]) => `${key}: ${formatObjectLiteral(value)}`)
    return `{ ${entries.join(', ')} }`
  }
  
  return String(obj)
}

/**
 * 将解析的配置转换为 TypeBox 对象
 */
function convertToTypeBoxObjects(config: any): any {
  if (!config || typeof config !== 'object') return {}

  const result: any = {}

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'object' && value !== null) {
      // 处理嵌套对象
      if ('format' in value) {
        result[key] = `t.String(${formatObjectLiteral(value)})`
      } else if ('minLength' in value || 'maxLength' in value) {
        result[key] = `t.String(${formatObjectLiteral(value)})`
      } else if ('minimum' in value || 'maximum' in value) {
        result[key] = `t.Number(${formatObjectLiteral(value)})`
      } else if ('default' in value) {
        const defaultValue = (value as any).default
        if (typeof defaultValue === 'string') {
          result[key] = `t.String(${formatObjectLiteral(value)})`
        } else if (typeof defaultValue === 'number') {
          result[key] = `t.Number(${formatObjectLiteral(value)})`
        } else if (typeof defaultValue === 'boolean') {
          result[key] = `t.Boolean(${formatObjectLiteral(value)})`
        } else {
          result[key] = formatObjectLiteral(value)
        }
      } else {
        result[key] = convertToTypeBoxObjects(value)
      }
    } else {
      result[key] = formatObjectLiteral(value)
    }
  }

  return result
}

/**
 * 合并 JSDoc 配置和手动配置
 */
function mergeConfigurations(jsdocConfig: TypeBoxConfig, manualConfig: any = {}): any {
  const merged: any = {}

  // 先添加 JSDoc 配置
  for (const [schemaName, tableConfig] of Object.entries(jsdocConfig)) {
    merged[schemaName] = {
      insert: convertToTypeBoxObjects(tableConfig.insert || {}),
      select: convertToTypeBoxObjects(tableConfig.select || {})
    }
  }

  // 然后合并手动配置（手动配置优先级更高）
  for (const [schemaName, tableConfig] of Object.entries(manualConfig)) {
    if (!merged[schemaName]) {
      merged[schemaName] = { insert: {}, select: {} }
    }

    if (typeof tableConfig === 'object' && tableConfig !== null) {
      const config = tableConfig as any
      if (config.insert) {
        Object.assign(merged[schemaName].insert, config.insert)
      }
      if (config.select) {
        Object.assign(merged[schemaName].select, config.select)
      }
    }
  }

  return merged
}

/**
 * 生成 TypeScript 代码
 */
function generateTypeScriptCode(config: GeneratorConfig, jsdocConfig: TypeBoxConfig, schemaCollector: SchemaCollector): string {
  const mergedConfig = mergeConfigurations(jsdocConfig, config.manualConfig)
  const imports = generateTypeBoxImports(jsdocConfig)

  let code = `/**
 * 自动生成的 TypeBox 配置文件
 * 基于 Schema 文件中的 JSDoc @typebox 注释生成
 * 请勿手动修改此文件
 */\n\n`

  // 添加导入语句
  if (config.includeElysia && imports) {
    code += `${imports}\n`
  }

  code += `import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'\n`
  
  // 添加 spreads 导入或内联实现
  if (config.spreadsImport) {
    code += `import { spreads } from '${config.spreadsImport}'\n`
  } else {
    // 内联 spreads 实现
    code += `// 内联 spreads 实现\n`
    code += `const spreads = (obj: any, type: string) => obj\n\n`
  }
  
  code += `import { dbSchema } from '${config.schemaImport || './schema/index'}'\n\n`

  // 生成静态 DbType 对象
  code += `/**\n * 数据库 TypeBox 配置\n */\n`
  code += `export const DbType = {\n`
  code += `  typebox: {\n`
  code += `    insert: {\n`

  // 生成 insert schemas
  for (const [schemaName, tableConfig] of Object.entries(mergedConfig)) {
    const config = tableConfig as any
    code += `      ${schemaName}: createInsertSchema(dbSchema.${schemaName}`
    
    // 收集非空配置项
    const validInsertConfigs: string[] = []
    for (const [fieldName, fieldConfig] of Object.entries(config.insert || {})) {
      // 跳过空配置对象
      if (typeof fieldConfig === 'object' && fieldConfig !== null && Object.keys(fieldConfig).length === 0) {
        continue
      }
      const configStr = typeof fieldConfig === 'string' ? fieldConfig : formatObjectLiteral(fieldConfig)
      validInsertConfigs.push(`        ${fieldName}: ${configStr}`)
    }
    
    // 只有在有有效配置时才添加第二个参数
    if (validInsertConfigs.length > 0) {
      code += `, {\n`
      code += validInsertConfigs.join(',\n') + '\n'
      code += `      }`
    }
    code += `),\n`
  }

  code += `    },\n`
  code += `    select: {\n`

  // 生成 select schemas
  for (const [schemaName, tableConfig] of Object.entries(mergedConfig)) {
    const config = tableConfig as any
    code += `      ${schemaName}: createSelectSchema(dbSchema.${schemaName}`
    
    // 收集非空配置项
    const validSelectConfigs: string[] = []
    for (const [fieldName, fieldConfig] of Object.entries(config.select || {})) {
      // 跳过空配置对象
      if (typeof fieldConfig === 'object' && fieldConfig !== null && Object.keys(fieldConfig).length === 0) {
        continue
      }
      const configStr = typeof fieldConfig === 'string' ? fieldConfig : formatObjectLiteral(fieldConfig)
      validSelectConfigs.push(`        ${fieldName}: ${configStr}`)
    }
    
    // 只有在有有效配置时才添加第二个参数
    if (validSelectConfigs.length > 0) {
      code += `, {\n`
      code += validSelectConfigs.join(',\n') + '\n'
      code += `      }`
    }
    code += `),\n`
  }

  code += `    }\n`
  code += `  },\n`
  code += `  spreads: {\n`
  code += `    insert: spreads({\n`

  // 生成 spreads insert
  for (const [schemaName, tableConfig] of Object.entries(mergedConfig)) {
    const config = tableConfig as any
    code += `      ${schemaName}: createInsertSchema(dbSchema.${schemaName}`
    
    // 收集非空配置项
    const validInsertConfigs: string[] = []
    for (const [fieldName, fieldConfig] of Object.entries(config.insert || {})) {
      // 跳过空配置对象
      if (typeof fieldConfig === 'object' && fieldConfig !== null && Object.keys(fieldConfig).length === 0) {
        continue
      }
      const configStr = typeof fieldConfig === 'string' ? fieldConfig : formatObjectLiteral(fieldConfig)
      validInsertConfigs.push(`        ${fieldName}: ${configStr}`)
    }
    
    // 只有在有有效配置时才添加第二个参数
    if (validInsertConfigs.length > 0) {
      code += `, {\n`
      code += validInsertConfigs.join(',\n') + '\n'
      code += `      }`
    }
    code += `),\n`
  }

  code += `    }, 'insert'),\n`
  code += `    select: spreads({\n`

  // 生成 spreads select
  for (const [schemaName, tableConfig] of Object.entries(mergedConfig)) {
    const config = tableConfig as any
    code += `      ${schemaName}: createSelectSchema(dbSchema.${schemaName}`
    
    // 收集非空配置项
    const validSelectConfigs: string[] = []
    for (const [fieldName, fieldConfig] of Object.entries(config.select || {})) {
      // 跳过空配置对象
      if (typeof fieldConfig === 'object' && fieldConfig !== null && Object.keys(fieldConfig).length === 0) {
        continue
      }
      const configStr = typeof fieldConfig === 'string' ? fieldConfig : formatObjectLiteral(fieldConfig)
      validSelectConfigs.push(`        ${fieldName}: ${configStr}`)
    }
    
    // 只有在有有效配置时才添加第二个参数
    if (validSelectConfigs.length > 0) {
      code += `, {\n`
      code += validSelectConfigs.join(',\n') + '\n'
      code += `      }`
    }
    code += `),\n`
  }

  code += `    }, 'select')\n`
  code += `  }\n`
  code += `} as const\n`

  return code
}

/**
 * 生成 TypeBox 配置文件
 */
export async function generateTypeBoxFile(config: GeneratorConfig): Promise<void> {
  try {
    // 创建 Schema 收集器
    const schemaCollector = createSchemaCollector({
      dbDir: config.dbDir,
      ...config.schemaConfig
    })

    // 收集表定义并生成 schema 索引文件
    const tables = await schemaCollector.collectTables()
    await schemaCollector.generateSchemaIndex(tables)

    // 解析 JSDoc 配置
    const paths = schemaCollector.getPaths()
    const jsdocConfig = await parseSchemaFiles(paths.schemaDir)

    // 生成 TypeScript 代码
    const code = generateTypeScriptCode(config, jsdocConfig, schemaCollector)

    // 确定输出路径
    const outputFileName = config.outputFileName || 'typebox-config.ts'
    const outputPath = schemaCollector.getOutputPath(outputFileName)

    // 写入文件
    fs.writeFileSync(outputPath, code, 'utf-8')

    console.log(`✅ TypeBox 配置文件已生成: ${outputPath}`)
    console.log(`📊 解析到 ${Object.keys(jsdocConfig).length} 个表的配置`)

    // 显示解析结果摘要
    for (const [schemaName, tableConfig] of Object.entries(jsdocConfig)) {
      const insertFields = Object.keys(tableConfig.insert || {}).length
      const selectFields = Object.keys(tableConfig.select || {}).length
      console.log(`   - ${schemaName}: ${insertFields} insert 字段, ${selectFields} select 字段`)
    }

  } catch (error) {
    console.error('❌ 生成 TypeBox 配置文件失败:', error)
    throw error
  }
}