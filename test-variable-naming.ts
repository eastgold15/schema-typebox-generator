import { pgTable, text, integer } from 'drizzle-orm/pg-core'

// 测试变量名保持不变（不添加Schema后缀）
export const userProfile = pgTable('user_profiles', {
  id: integer('id').primaryKey(),
  email: text('email').notNull(), // @typebox { "format": "email" }
  displayName: text('display_name').notNull(), // @typebox { "minLength": 2, "maxLength": 50 }
})

export const productCatalog = pgTable('product_catalog', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(), // @typebox { "minLength": 1, "maxLength": 100 }
  price: integer('price').notNull(), // @typebox { "minimum": 0 }
})