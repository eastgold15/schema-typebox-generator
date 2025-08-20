#!/usr/bin/env node

import * as path from 'path'
import * as fs from 'fs'
import { generate, watch, parseConfig } from './index.js'

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
Schema TypeBox Generator - 自动生成 TypeBox 配置

使用方法:
  schema-typebox-gen <command> [options]

命令:
  generate <schemaDir> <outputPath>  生成 TypeBox 配置文件
  watch <schemaDir> <outputPath>     监听模式，自动重新生成
  parse <schemaDir>                  仅解析配置，不生成文件
  help                               显示帮助信息

选项:
  --no-elysia                        不包含 Elysia 相关代码
  --config <configFile>              指定配置文件路径

示例:
  # 生成配置文件
  schema-typebox-gen generate ./src/db/schema ./src/db/database.types.ts
  
  # 监听模式
  schema-typebox-gen watch ./src/db/schema ./src/db/database.types.ts
  
  # 仅解析配置
  schema-typebox-gen parse ./src/db/schema
  
  # 使用配置文件
  schema-typebox-gen generate --config ./schema-gen.config.js
`)
}

/**
 * 解析命令行参数
 */
function parseArgs(args: string[]) {
  const result: any = {
    command: '',
    schemaDir: '',
    outputPath: '',
    options: {
      includeElysia: true,
      configFile: null
    }
  }
  
  let i = 0
  while (i < args.length) {
    const arg = args[i]
    
    if (arg === '--no-elysia') {
      result.options.includeElysia = false
    } else if (arg === '--config') {
      result.options.configFile = args[++i]
    } else if (!result.command) {
      result.command = arg
    } else if (!result.schemaDir) {
      result.schemaDir = arg
    } else if (!result.outputPath) {
      result.outputPath = arg
    }
    
    i++
  }
  
  return result
}

/**
 * 加载配置文件
 */
async function loadConfig(configFile: string) {
  const configPath = path.resolve(configFile)
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`配置文件不存在: ${configPath}`)
  }
  
  try {
    // 使用 require 加载配置文件
    const config = require(configPath)
    return config.default || config
  } catch (error) {
    throw new Error(`加载配置文件失败: ${error}`)
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    showHelp()
    return
  }
  
  const parsed = parseArgs(args)
  
  try {
    // 如果指定了配置文件，加载配置
    if (parsed.options.configFile) {
      const config = await loadConfig(parsed.options.configFile)
      
      switch (parsed.command) {
        case 'generate':
          await generate(config.schemaDir, config.outputPath, config)
          break
        case 'watch':
          await watch(config.schemaDir, config.outputPath, config)
          break
        case 'parse':
          const result = await parseConfig(config.schemaDir)
          console.log(JSON.stringify(result, null, 2))
          break
        default:
          console.error(`未知命令: ${parsed.command}`)
          showHelp()
          process.exit(1)
      }
      return
    }
    
    // 使用命令行参数
    switch (parsed.command) {
      case 'generate':
        if (!parsed.schemaDir || !parsed.outputPath) {
          console.error('错误: generate 命令需要 schemaDir 和 outputPath 参数')
          showHelp()
          process.exit(1)
        }
        await generate(parsed.schemaDir, parsed.outputPath, parsed.options)
        break
        
      case 'watch':
        if (!parsed.schemaDir || !parsed.outputPath) {
          console.error('错误: watch 命令需要 schemaDir 和 outputPath 参数')
          showHelp()
          process.exit(1)
        }
        console.log('🔍 启动监听模式...')
        await watch(parsed.schemaDir, parsed.outputPath, parsed.options)
        console.log('👀 正在监听文件变化，按 Ctrl+C 退出')
        // 保持进程运行
        process.on('SIGINT', () => {
          console.log('\n👋 停止监听')
          process.exit(0)
        })
        break
        
      case 'parse':
        if (!parsed.schemaDir) {
          console.error('错误: parse 命令需要 schemaDir 参数')
          showHelp()
          process.exit(1)
        }
        const result = await parseConfig(parsed.schemaDir)
        console.log(JSON.stringify(result, null, 2))
        break
        
      default:
        console.error(`未知命令: ${parsed.command}`)
        showHelp()
        process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  }
}

// 运行主函数
main().catch(console.error)