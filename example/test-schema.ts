// 测试 Schema 文件
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'

/**
 * 用户表
 */
export const userSchema = pgTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').notNull(), // @typebox { "format": "email" }
  name: text('name').notNull(), // @typebox { "minLength": 2, "maxLength": 50 }
  age: integer('age'), // @typebox { "minimum": 0, "maximum": 120 }
  createdAt: timestamp('created_at').defaultNow(), // @typebox
  updatedAt: timestamp('updated_at').defaultNow()
})

/**
 * 商品表
 */
export const productSchema = pgTable('products', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(), // @typebox { "minLength": 1, "maxLength": 100 }
  price: integer('price').notNull(), // @typebox { "minimum": 0 }
  description: text('description'), // @typebox { "maxLength": 1000 }
  stock: integer('stock').default(0), // @typebox { "minimum": 0 }
  createdAt: timestamp('created_at').defaultNow(), // @typebox
  updatedAt: timestamp('updated_at').defaultNow() // @typebox
})