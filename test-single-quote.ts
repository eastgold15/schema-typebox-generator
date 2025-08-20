import { pgTable, text, integer } from 'drizzle-orm/pg-core'

export const testSchema = pgTable('test', {
  id: integer('id').primaryKey(),
  email: text('email').notNull(), // @typebox { 'format': 'email' }
  name: text('name').notNull(), // @typebox { minLength: 2, maxLength: 50 }
  status: text('status'), // @typebox { enum: ['active', 'inactive'] }
})


import {
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
	decimal,
	json
} from "drizzle-orm/pg-core";

/**
 * 商品分类表
 */
export const categoriesSchema = pgTable("categories", {
	id: serial("id").primaryKey(), // @typebox
	name: varchar("name", { length: 100 }).notNull(), // @typebox { minLength: 1, maxLength: 100 }
	slug: varchar("slug", { length: 100 }).notNull().unique(), // @typebox { format: 'slug', minLength: 1, maxLength: 100 }
	description: text("description"), // @typebox
	parentId: integer("parent_id"), // @typebox
	sortOrder: integer("sort_order").default(0), // @typebox { default: 0 }
	isVisible: boolean("is_visible").default(true), // @typebox { default: true }
	icon: varchar("icon", { length: 255 }), // @typebox
	image: varchar("image", { length: 255 }), // @typebox
	createdAt: timestamp("created_at").defaultNow(), // @typebox
	updatedAt: timestamp("updated_at").defaultNow(), // @typebox
});

/**
 * 商品表
 */
export const productsSchema = pgTable("products", {
	
	id: serial("id").primaryKey(), // @typebox
	name: varchar("name", { length: 255 }).notNull(), // @typebox { minLength: 1, maxLength: 255 }
	slug: varchar("slug", { length: 255 }).notNull().unique(), // @typebox { format: 'slug', minLength: 1, maxLength: 255 }
	description: text("description"), // @typebox
	shortDescription: text("short_description"), // @typebox
	price: decimal("price", { precision: 10, scale: 2 }).notNull(), // @typebox { minimum: 0 }
	comparePrice: decimal("compare_price", { precision: 10, scale: 2 }), // @typebox { minimum: 0 }
	cost: decimal("cost", { precision: 10, scale: 2 }), // @typebox { minimum: 0 }
	sku: varchar("sku", { length: 100 }).unique(), // @typebox { maxLength: 100 }
	barcode: varchar("barcode", { length: 100 }), // @typebox { maxLength: 100 }
	weight: decimal("weight", { precision: 8, scale: 2 }), // @typebox { minimum: 0 }
	dimensions: json("dimensions"), // @typebox
	images: json("images"), // @typebox
	videos: json("videos"), // @typebox
	colors: json("colors"), // @typebox
	sizes: json("sizes"), // @typebox
	materials: json("materials"), // @typebox
	careInstructions: text("care_instructions"), // @typebox
	features: json("features"), // @typebox
	specifications: json("specifications"), // @typebox
	categoryId: integer("category_id").references(() => categoriesSchema.id), // @typebox
	stock: integer("stock").default(0), // @typebox { default: 0, minimum: 0 }
	minStock: integer("min_stock").default(0), // @typebox { default: 0, minimum: 0 }
	isActive: boolean("is_active").default(true), // @typebox { default: true }
	isFeatured: boolean("is_featured").default(false), // @typebox { default: false }
	metaTitle: varchar("meta_title", { length: 255 }), // @typebox { maxLength: 255 }
	metaDescription: text("meta_description"), // @typebox
	metaKeywords: varchar("meta_keywords", { length: 500 }), // @typebox { maxLength: 500 }
	createdAt: timestamp("created_at").defaultNow(), // @typebox
	updatedAt: timestamp("updated_at").defaultNow(), // @typebox
});

/**
 * 商品评价表
 */
export const reviewsSchema = pgTable("reviews", {
	id: serial("id").primaryKey(), // @typebox
	productId: integer("product_id").references(() => productsSchema.id).notNull(), // @typebox
	userName: varchar("user_name", { length: 100 }).notNull(), // @typebox { minLength: 1, maxLength: 100 }
	userEmail: varchar("user_email", { length: 255 }), // @typebox { format: 'email', maxLength: 255 }
	rating: integer("rating").notNull(), // @typebox { minimum: 1, maximum: 5 }
	title: varchar("title", { length: 255 }), // @typebox { maxLength: 255 }
	content: text("content").notNull(), // @typebox { minLength: 1 }
	isVerified: boolean("is_verified").default(false), // @typebox { default: false }
	isApproved: boolean("is_approved").default(false), // @typebox { default: false }
	createdAt: timestamp("created_at").defaultNow(), // @typebox
	updatedAt: timestamp("updated_at").defaultNow(), // @typebox
});

/**
 * 网站配置表
 */
export const siteConfigSchema = pgTable("site_config", {
	id: serial("id").primaryKey(), // @typebox
	key: varchar("key", { length: 100 }).notNull().unique(), // @typebox { minLength: 1, maxLength: 100 }
	value: text("value"), // @typebox
	description: text("description"), // @typebox
	category: varchar("category", { length: 50 }).default("general"), // @typebox { default: "general", maxLength: 50 }
	createdAt: timestamp("created_at").defaultNow(), // @typebox
	updatedAt: timestamp("updated_at").defaultNow(), // @typebox
});

/**
 * 广告管理表
 */
export const advertisementsSchema = pgTable("advertisements", {
	id: serial("id").primaryKey(), // @typebox
	title: varchar("title", { length: 255 }).notNull(), // @typebox { minLength: 1, maxLength: 255 }
	type: varchar("type", { length: 50 }).notNull(), // @typebox { enum: ["banner", "carousel"], maxLength: 50 }
	image: text("image").notNull(), // @typebox { minLength: 1 }
	link: varchar("link", { length: 500 }), // @typebox { format: 'uri', maxLength: 500 }
	position: varchar("position", { length: 100 }), // @typebox { maxLength: 100 }
	sortOrder: integer("sort_order").default(0), // @typebox { default: 0 }
	isActive: boolean("is_active").default(true), // @typebox { default: true }
	startDate: timestamp("start_date"), // @typebox
	endDate: timestamp("end_date"), // @typebox
	createdAt: timestamp("created_at").defaultNow(), // @typebox
	updatedAt: timestamp("updated_at").defaultNow(), // @typebox
});

/**
 * 顶部配置表
 */
export const headerConfigSchema = pgTable("header_config", {
	id: serial("id").primaryKey(), // @typebox
	shippingText: varchar("shipping_text", { length: 200 }).default("FREE SHIPPING on orders over $59* details"), // @typebox { default: "FREE SHIPPING on orders over $59* details", maxLength: 200 }
	trackOrderText: varchar("track_order_text", { length: 100 }).default("Track Order"), // @typebox { default: "Track Order", maxLength: 100 }
	helpText: varchar("help_text", { length: 100 }).default("Help"), // @typebox { default: "Help", maxLength: 100 }
	trackOrderUrl: varchar("track_order_url", { length: 255 }).default("#"), // @typebox { default: "#", maxLength: 255 }
	helpUrl: varchar("help_url", { length: 255 }).default("#"), // @typebox { default: "#", maxLength: 255 }
	isActive: boolean("is_active").default(true), // @typebox { default: true }
	createdAt: timestamp("created_at").defaultNow(), // @typebox
	updatedAt: timestamp("updated_at").defaultNow(), // @typebox
});

/**
 * 底部配置表
 */
export const footerConfigSchema = pgTable("footer_config", {
	id: serial("id").primaryKey(), // @typebox
	sectionTitle: varchar("section_title", { length: 100 }).notNull(), // @typebox { minLength: 1, maxLength: 100 }
	linkText: varchar("link_text", { length: 100 }).notNull(), // @typebox { minLength: 1, maxLength: 100 }
	linkUrl: varchar("link_url", { length: 255 }).notNull(), // @typebox { minLength: 1, maxLength: 255 }
	sortOrder: integer("sort_order").default(0), // @typebox { default: 0 }
	isActive: boolean("is_active").default(true), // @typebox { default: true }
	createdAt: timestamp("created_at").defaultNow(), // @typebox
	updatedAt: timestamp("updated_at").defaultNow(), // @typebox
});

