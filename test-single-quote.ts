import { pgTable, text, integer } from 'drizzle-orm/pg-core'

export const testSchema = pgTable('test', {
  id: integer('id').primaryKey(),
  email: text('email').notNull(), // @typebox { 'format': 'email' }
  name: text('name').notNull(), // @typebox { minLength: 2, maxLength: 50 }
  status: text('status'), // @typebox { enum: ['active', 'inactive'] }
})