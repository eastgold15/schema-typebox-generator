/**
 * 自动生成的 TypeBox 配置文件
 * 基于 Schema 文件中的 JSDoc @typebox 注释生成
 * 请勿手动修改此文件
 */

import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { spreads } from './dizzle.type.js'
import { dbSchema, tableNames } from './generated-schema.js'

/**
 * JSDoc 解析的 TypeBox 配置
 */
export const jsdocConfig = {} as const

/**
 * 合并后的 Schema 自定义配置
 */
export const schemaCustomizations = {
} as const

/**
 * 数据库 TypeBox 配置
 */
export const DbType = {
  typebox: {
    insert: {
    },
    select: {
    }
  },
  spreads: {
    insert: spreads({
    }, 'insert'),
    select: spreads({
    }, 'select')
  }
} as const
