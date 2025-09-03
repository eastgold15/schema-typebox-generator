/**
 * 自动生成的 TypeBox 配置文件
 * 基于 Schema 文件中的 JSDoc @typebox 注释生成
 * 请勿手动修改此文件
 */

import { t } from 'elysia'
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
      abcchema: createInsertSchema(dbSchema.abcchema, {
        id: t.String({ format: "email" }),
        email: t.String({ format: "email" }),
        phone: t.String({ format: "phone" })
      }),
    },
    select: {
      abcchema: createSelectSchema(dbSchema.abcchema, {
        id: t.String({ format: "email" }),
        email: t.String({ format: "email" }),
        phone: t.String({ format: "phone" })
      }),
    }
  },
  spreads: {
    insert: spreads({
      abcchema: createInsertSchema(dbSchema.abcchema, {
        id: t.String({ format: "email" }),
        email: t.String({ format: "email" }),
        phone: t.String({ format: "phone" })
      }),
    }, 'insert'),
    select: spreads({
      abcchema: createSelectSchema(dbSchema.abcchema, {
        id: t.String({ format: "email" }),
        email: t.String({ format: "email" }),
        phone: t.String({ format: "phone" })
      }),
    }, 'select')
  }
} as const
