/**
 * Schema TypeBox Generator
 * 自动从 Drizzle Schema 文件中解析 JSDoc @typebox 注释并生成 TypeBox 配置
 */

export { generateTypeBoxFile, watchAndGenerate } from './generator.js'
export type { GeneratorConfig } from './generator.js'
export { generateTypeBoxImports, parseSchemaFile, parseSchemaFiles } from './parser.js'
export type { TypeBoxConfig } from './parser.js'

/**
 * 默认配置
 */
export const defaultConfig = {
  includeElysia: true,
  manualConfig: {}
} as const

/**
 * 快速生成函数
 * @param schemaDir Schema 文件夹路径
 * @param outputPath 输出文件路径
 * @param options 可选配置
 */
export async function generate(
  schemaDir: string,
  outputPath: string,
  options: Partial<Omit<import('./generator.js').GeneratorConfig, 'schemaDir' | 'outputPath'>> = {}
) {
  const { generateTypeBoxFile } = await import('./generator.js')
  
  const config = {
    schemaDir,
    outputPath,
    ...defaultConfig,
    ...options
  }
  
  return generateTypeBoxFile(config)
}

/**
 * 监听模式
 * @param schemaDir Schema 文件夹路径
 * @param outputPath 输出文件路径
 * @param options 可选配置
 */
export async function watch(
  schemaDir: string,
  outputPath: string,
  options: Partial<Omit<import('./generator.js').GeneratorConfig, 'schemaDir' | 'outputPath'>> = {}
) {
  const { watchAndGenerate, generateTypeBoxFile } = await import('./generator.js')
  
  const config = {
    schemaDir,
    outputPath,
    ...defaultConfig,
    ...options
  }
  
  // 先生成一次
  await generateTypeBoxFile(config)
  
  // 然后开始监听
  watchAndGenerate(config)
}

/**
 * 解析配置（不生成文件）
 * @param schemaDir Schema 文件夹路径
 */
export async function parseConfig(schemaDir: string) {
  const { parseSchemaFiles } = await import('./parser.js')
  return parseSchemaFiles(schemaDir)
}