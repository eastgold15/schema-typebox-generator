// ---------------------------登录相关--------------------------------------

import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";

export const role = pgEnum('role', ['user', 'admin']);
export const abctate = pgEnum('user_state', ['active', 'inactive']);
// 用户表
export const userSchema = pgTable(
  "abc",
  {
    /**
     * 主键
     * @typebox  { format: 'email' }
     */
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    password: varchar("password", { length: 255 }), // OAuth用户可能没有密码
    email: varchar("email", { length: 100 }).unique(),//@typebox { format: 'email' } 邮箱
    phone: varchar("phone", { length: 20 }),//手机号  @typebox { format: 'phone' } 
    nickname: varchar("nickname", { length: 50 }),
    avatar: varchar("avatar", { length: 255 }),
    role: role("role").notNull().default("user"), // user, admin
    abctate: abctate("user_state").notNull().default("active"), // active, inactive
    // OAuth 相关字段
    googleId: varchar("google_id", { length: 100 }), // Google OAuth ID
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (abc) => [
    index("user_id_idx").on(abc.id),
    index("user_email_idx").on(abc.email),
    index("user_google_id_idx").on(abc.googleId),
  ],
);


export const tokenSchema = pgTable(
  "tokens",
  {
    id: serial("id").primaryKey(),
    ownerId: serial("owner_id").references(() => userSchema.id),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (token) => [index("token_id_idx").on(token.id)],
);