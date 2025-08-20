import * as fs from 'fs'
import * as path from 'path'
import { TypeBoxConfig, parseSchemaFiles, generateTypeBoxImports } from './parser.js'

/**
 * 生成器配置接口
 */
export interface GeneratorConfig {
  /** Schema 文件夹路径 */
  schemaDir: string
  /** 输出文件路径 */
  outputPath: string
  /** 手动配置覆盖 */
  manualConfig?: Record<string, any>
  /** 是否包含 Elysia 相关代码 */
  includeElysia?: boolean
  /** spreads 导入路径 */
  spreadsImport?: string
  /** dbSchema 和 tableNames 导入路径 */
  schemaImport?: string
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
        result[key] = `t.String(${JSON.stringify(value)})`
      } else if ('minLength' in value || 'maxLength' in value) {
        result[key] = `t.String(${JSON.stringify(value)})`
      } else if ('minimum' in value || 'maximum' in value) {
        result[key] = `t.Number(${JSON.stringify(value)})`
      } else if ('default' in value) {
        const defaultValue = (value as any).default
        if (typeof defaultValue === 'string') {
          result[key] = `t.String(${JSON.stringify(value)})`
        } else if (typeof defaultValue === 'number') {
          result[key] = `t.Number(${JSON.stringify(value)})`
        } else if (typeof defaultValue === 'boolean') {
          result[key] = `t.Boolean(${JSON.stringify(value)})`
        } else {
          result[key] = JSON.stringify(value)
        }
      } else {
        result[key] = convertToTypeBoxObjects(value)
      }
    } else {
      result[key] = JSON.stringify(value)
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
function generateTypeScriptCode(config: GeneratorConfig, jsdocConfig: TypeBoxConfig): string {
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
  code += `import { spreads } from '${config.spreadsImport || './dizzle.type.js'}'\n`
  code += `import { dbSchema, tableNames } from '${config.schemaImport || './generated-schema.js'}'\n\n`

  // 生成配置对象
  code += `/**\n * JSDoc 解析的 TypeBox 配置\n */\n`
  
  // 过滤掉空对象的 jsdocConfig
  const filteredJsdocConfig: any = {}
  for (const [schemaName, tableConfig] of Object.entries(jsdocConfig)) {
    filteredJsdocConfig[schemaName] = {
      insert: {},
      select: {}
    }
    
    // 过滤 insert 配置
    for (const [fieldName, fieldConfig] of Object.entries(tableConfig.insert || {})) {
      if (typeof fieldConfig === 'object' && fieldConfig !== null && Object.keys(fieldConfig).length === 0) {
        continue
      }
      filteredJsdocConfig[schemaName].insert[fieldName] = fieldConfig
    }
    
    // 过滤 select 配置
    for (const [fieldName, fieldConfig] of Object.entries(tableConfig.select || {})) {
      if (typeof fieldConfig === 'object' && fieldConfig !== null && Object.keys(fieldConfig).length === 0) {
        continue
      }
      filteredJsdocConfig[schemaName].select[fieldName] = fieldConfig
    }
  }
  
  code += `export const jsdocConfig = ${JSON.stringify(filteredJsdocConfig, null, 2)} as const\n\n`

  // 生成合并后的配置
  code += `/**\n * 合并后的 Schema 自定义配置\n */\n`
  code += `export const schemaCustomizations = {\n`

  for (const [schemaName, tableConfig] of Object.entries(mergedConfig)) {
    const config = tableConfig as any
    code += `  ${schemaName}: {\n`
    code += `    insert: {\n`
    for (const [fieldName, fieldConfig] of Object.entries(config.insert || {})) {
      // 跳过空配置对象
          if (typeof fieldConfig === 'object' && fieldConfig !== null && Object.keys(fieldConfig).length === 0) {
            continue
          }
      const configStr = typeof fieldConfig === 'string' ? fieldConfig : JSON.stringify(fieldConfig)
      code += `        ${fieldName}: ${configStr},\n`
    }
    code += `    },\n`
    code += `    select: {\n`
    for (const [fieldName, fieldConfig] of Object.entries(config.select || {})) {
      // 跳过空配置对象
          if (typeof fieldConfig === 'object' && fieldConfig !== null && Object.keys(fieldConfig).length === 0) {
            continue
          }
      const configStr = typeof fieldConfig === 'string' ? fieldConfig : JSON.stringify(fieldConfig)
      code += `        ${fieldName}: ${configStr},\n`
    }
    code += `    }\n`
    code += `  },\n`
  }

  code += `} as const\n\n`

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
      const configStr = typeof fieldConfig === 'string' ? fieldConfig : JSON.stringify(fieldConfig)
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
      const configStr = typeof fieldConfig === 'string' ? fieldConfig : JSON.stringify(fieldConfig)
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
      const configStr = typeof fieldConfig === 'string' ? fieldConfig : JSON.stringify(fieldConfig)
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
      const configStr = typeof fieldConfig === 'string' ? fieldConfig : JSON.stringify(fieldConfig)
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
    // 解析 JSDoc 配置
    const jsdocConfig = parseSchemaFiles(config.schemaDir)

    // 生成 TypeScript 代码
    const code = generateTypeScriptCode(config, jsdocConfig)

    // 确保输出目录存在
    const outputDir = path.dirname(config.outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 写入文件
    fs.writeFileSync(config.outputPath, code, 'utf-8')

    console.log(`✅ TypeBox 配置文件已生成: ${config.outputPath}`)
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

/**
 * 监听文件变化并自动重新生成
 */
export function watchAndGenerate(config: GeneratorConfig): void {
  console.log(`🔍 监听 Schema 文件变化: ${config.schemaDir}`)

  fs.watch(config.schemaDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.ts')) {
      console.log(`📝 检测到文件变化: ${filename}`)
      generateTypeBoxFile(config).catch(console.error)
    }
  })
}