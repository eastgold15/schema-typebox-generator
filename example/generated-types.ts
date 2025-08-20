/**
 * 自动生成的 TypeBox 配置文件
 * 基于 Schema 文件中的 JSDoc @typebox 注释生成
 * 请勿手动修改此文件
 */

import { t } from 'elysia'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { spreads } from './dizzle.type.js'
import { dbSchema, tableNames } from './generated-schema.js'

/**
 * JSDoc 解析的 TypeBox 配置
 */
export const jsdocConfig = {
  "usersSchema": {
    "insert": {
      "email": {
        "format": "email"
      },
      "name": {
        "minLength": 2,
        "maxLength": 50
      },
      "age": {
        "minimum": 0,
        "maximum": 120
      }
    },
    "select": {
      "email": {
        "format": "email"
      },
      "name": {
        "minLength": 2,
        "maxLength": 50
      },
      "age": {
        "minimum": 0,
        "maximum": 120
      }
    }
  },
  "productsSchema": {
    "insert": {
      "name": {
        "minLength": 1,
        "maxLength": 100
      },
      "price": {
        "minimum": 0
      },
      "description": {
        "maxLength": 1000
      },
      "stock": {
        "minimum": 0
      }
    },
    "select": {
      "name": {
        "minLength": 1,
        "maxLength": 100
      },
      "price": {
        "minimum": 0
      },
      "description": {
        "maxLength": 1000
      },
      "stock": {
        "minimum": 0
      }
    }
  }
} as const

/**
 * 合并后的 Schema 自定义配置
 */
export const schemaCustomizations = {
  usersSchema: {
    insert: {
        email: t.String({"format":"email"}),
        name: t.String({"minLength":2,"maxLength":50}),
        age: t.Number({"minimum":0,"maximum":120}),
    },
    select: {
        email: t.String({"format":"email"}),
        name: t.String({"minLength":2,"maxLength":50}),
        age: t.Number({"minimum":0,"maximum":120}),
    }
  },
  productsSchema: {
    insert: {
        name: t.String({"minLength":1,"maxLength":100}),
        price: t.Number({"minimum":0}),
        description: t.String({"maxLength":1000}),
        stock: t.Number({"minimum":0}),
    },
    select: {
        name: t.String({"minLength":1,"maxLength":100}),
        price: t.Number({"minimum":0}),
        description: t.String({"maxLength":1000}),
        stock: t.Number({"minimum":0}),
    }
  },
} as const

/**
 * 数据库 TypeBox 配置
 */
export const DbType = {
  typebox: {
    insert: {
      usersSchema: createInsertSchema(dbSchema.usersSchema, {
        email: t.String({"format":"email"}),
        name: t.String({"minLength":2,"maxLength":50}),
        age: t.Number({"minimum":0,"maximum":120})
      }),
      productsSchema: createInsertSchema(dbSchema.productsSchema, {
        name: t.String({"minLength":1,"maxLength":100}),
        price: t.Number({"minimum":0}),
        description: t.String({"maxLength":1000}),
        stock: t.Number({"minimum":0})
      }),
    },
    select: {
      usersSchema: createSelectSchema(dbSchema.usersSchema, {
        email: t.String({"format":"email"}),
        name: t.String({"minLength":2,"maxLength":50}),
        age: t.Number({"minimum":0,"maximum":120})
      }),
      productsSchema: createSelectSchema(dbSchema.productsSchema, {
        name: t.String({"minLength":1,"maxLength":100}),
        price: t.Number({"minimum":0}),
        description: t.String({"maxLength":1000}),
        stock: t.Number({"minimum":0})
      }),
    }
  },
  spreads: {
    insert: spreads({
      usersSchema: createInsertSchema(dbSchema.usersSchema, {
        email: t.String({"format":"email"}),
        name: t.String({"minLength":2,"maxLength":50}),
        age: t.Number({"minimum":0,"maximum":120})
      }),
      productsSchema: createInsertSchema(dbSchema.productsSchema, {
        name: t.String({"minLength":1,"maxLength":100}),
        price: t.Number({"minimum":0}),
        description: t.String({"maxLength":1000}),
        stock: t.Number({"minimum":0})
      }),
    }, 'insert'),
    select: spreads({
      usersSchema: createSelectSchema(dbSchema.usersSchema, {
        email: t.String({"format":"email"}),
        name: t.String({"minLength":2,"maxLength":50}),
        age: t.Number({"minimum":0,"maximum":120})
      }),
      productsSchema: createSelectSchema(dbSchema.productsSchema, {
        name: t.String({"minLength":1,"maxLength":100}),
        price: t.Number({"minimum":0}),
        description: t.String({"maxLength":1000}),
        stock: t.Number({"minimum":0})
      }),
    }, 'select')
  }
} as const
