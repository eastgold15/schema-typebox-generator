#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import { CommentManager } from './comment-plugin.js'
import { generateTypeBoxFile, type GeneratorConfig } from './generator.js'
import { createSchemaCollector } from './schema-collector.js'

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
🚀 TypeBox Schema Generator CLI (简化版)

用法:
  npx tsx src/cli.ts <dbDir>

参数:
  dbDir                                         数据库文件夹路径

功能:
  自动在指定的db文件夹下生成以下文件：
  - db/schema/index.ts                          导出所有schema文件
  - db/comment/comments-config.ts               注释配置文件
  - db/typebox.type.ts                         TypeBox类型配置文件

示例:
  # 处理test-db文件夹
  npx tsx src/cli.ts test-db
  
  # 处理当前目录下的db文件夹
  npx tsx src/cli.ts ./db
`)
}

/**
 * 解析命令行参数
 */
function parseArgs(args: string[]) {
  const result: any = {
    dbDir: '',
    options: {
      includeElysia: true
    }
  }

  if (args.length > 0 && !args[0].startsWith('--')) {
    result.dbDir = args[0]
  }

  return result
}



/**
 * TypeBox生成器CLI类
 */
class TypeBoxCLI {
  private args: string[]
  constructor() {
    this.args = process.argv.slice(2)
  }
  /**
   * 运行CLI
   */
  public async run(): Promise<void> {
    // 检查是否有help参数
    if (this.args.includes('--help') || this.args.includes('-h') || this.args.length === 0) {
      showHelp()
      return
    }

    const parsed = parseArgs(this.args)

    if (!parsed.dbDir) {
      console.error('❌ 错误: 需要指定数据库文件夹路径')
      showHelp()
      process.exit(1)
    }

    try {
      await this.processDbDirectory(parsed.dbDir)
    } catch (error) {
      console.error('❌ 执行失败:', error)
      process.exit(1)
    }
  }

  /**
   * 处理数据库目录，生成所有必需文件
   */
  private async processDbDirectory(dbDir: string): Promise<void> {
    console.log(`🚀 开始处理数据库目录: ${dbDir}`)

    const dbPath = path.resolve(dbDir)
    console.log(`📂 数据库目录: ${dbPath}`)
    const schemaPath = path.join(dbPath, 'schema')

    // 检查目录是否存在
    if (!fs.existsSync(dbPath)) {
      throw new Error(`数据库目录不存在: ${dbPath}`)
    }

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema目录不存在: ${schemaPath}`)
    }

    try {
      // 1. 生成 schema/index.ts 导出文件
      console.log('📁 生成 schema 导出文件...')
      const collector = createSchemaCollector({
        dbDir: dbDir,
        schemaDir: 'schema',
        outputDir: '/schema'  // 直接在schema目录下生成index.ts
      })

      await collector.generateSchemaExports()
      console.log('✅ schema/index.ts 生成完成')

      // 2. 生成注释配置文件
      console.log('📝 生成注释配置文件...')
      const commentManager = new CommentManager()
      const commentDir = path.join(dbPath, 'comment')
      
      // 确保 comment 目录存在
      if (!fs.existsSync(commentDir)) {
        fs.mkdirSync(commentDir, { recursive: true })
      }
      
      const commentsOutputPath = path.join(commentDir, 'comments-config.ts')
      console.log("commentsOutputPath", commentsOutputPath)

      await commentManager.generateCommentConfigFile(schemaPath, commentsOutputPath)
      console.log('✅ comment/comments-config.ts 生成完成')
      
      // 复制 comment.plugin.ts 到 comment 目录
      const sourcePluginPath = path.join(process.cwd(), 'comment.plugin.ts')
      const targetPluginPath = path.join(commentDir, 'comment.plugin.ts')
      
      if (fs.existsSync(sourcePluginPath)) {
        fs.copyFileSync(sourcePluginPath, targetPluginPath)
        console.log('✅ comment.plugin.ts 复制完成')
      } else {
        console.log('⚠️ 根目录未找到 comment.plugin.ts 文件')
      }

      // 3. 生成 TypeBox 配置文件
      console.log('🔧 生成 TypeBox 配置文件...')

      // 先生成到默认位置
      const config: GeneratorConfig = {
        dbDir: dbDir,
        outputFileName: 'typebox.type.ts',
        includeElysia: true,
        spreadsImport: undefined,
        schemaConfig: {}
      }

      await generateTypeBoxFile(config)

      // 移动文件到正确位置
      const sourcePath = path.join(dbPath, 'schema', 'typebox.type.ts')
      const targetPath = path.join(dbPath, 'typebox.type.ts')

      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, targetPath)
        console.log('✅ typebox.type.ts 生成完成')
      } else {
        console.log('⚠️ typebox.type.ts 文件未找到，可能生成失败')
      }

      console.log('🎉 所有文件生成完成!')
      console.log(`📂 生成的文件:`)
      console.log(`   - ${path.join(dbDir, 'schema/index.ts')}`)
      console.log(`   - ${path.join(dbDir, 'comment/comments-config.ts')}`)
      console.log(`   - ${path.join(dbDir, 'comment/comment.plugin.ts')}`)
      console.log(`   - ${path.join(dbDir, 'typebox.type.ts')}`)

    } catch (error) {
      console.error('❌ 生成过程中出现错误:', error)
      throw error
    }
  }
}

/**
 * 主函数
 */
async function main() {
  const cli = new TypeBoxCLI()
  await cli.run()
}

// 运行主函数
if (process.argv[1] && process.argv[1].endsWith('cli.ts')) {
  main().catch(console.error)
}

// 导出供其他模块使用
export { main, TypeBoxCLI }
