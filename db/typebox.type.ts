/**
 * 自动生成的 TypeBox 配置文件
 * 基于 Schema 文件中的 JSDoc @typebox 注释生成
 * 请勿手动修改此文件
 */

import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
// 内联 spreads 实现
const spreads = (obj: any, type: string) => obj

import { dbSchema } from './schema/index'

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
