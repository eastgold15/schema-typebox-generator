# Schema TypeBox Generator

自动从 Drizzle Schema 文件中解析 JSDoc `@typebox` 注释并生成 TypeBox 配置的工具库。支持生成 schema 索引、注释配置和 TypeBox 类型定义。

## 特性

- 🔍 **自动解析**: 从 Drizzle Schema 文件中自动解析 `@typebox` JSDoc 注释
- 📝 **代码生成**: 生成完整的 schema 索引、注释配置和 TypeBox 类型文件
- 🛠️ **CLI 工具**: 提供简化的命令行工具，一键生成所有必要文件
- 🔌 **插件支持**: 内置注释插件，可与 Drizzle 和 Elysia 无缝集成
- ⚙️ **可配置**: 支持自定义配置和灵活的文件结构

## 安装

```bash
bun add @pori15/schema-typebox-generator
# 或
npm install @pori15/schema-typebox-generator
```

## 使用方法

### 1. 在 Schema 文件中添加 JSDoc 注释

```typescript
// db/schema/user.ts
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const userSchema = pgTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').notNull(), // @typebox { "format": "email" }
  name: text('name').notNull(), // @typebox { "minLength": 2, "maxLength": 50 }
  age: integer('age'), // @typebox { "minimum": 0, "maximum": 120 }
  createdAt: timestamp('created_at').defaultNow(), // @typebox
  updatedAt: timestamp('updated_at').defaultNow() // @typebox
})
```

### 2. 使用 CLI 工具生成文件

```bash
# 一键生成所有必要文件
npx schema-typebox-gen db

# 或者使用源码运行
npx tsx src/cli.ts db
```

这个命令会自动生成以下文件：
- `db/schema/index.ts` - Schema 索引文件，导出所有 schema
- `db/comments-config.ts` - 注释配置文件
- `db/typebox.type.ts` - TypeBox 类型定义文件

### 3. 使用生成的配置文件

#### 使用注释配置

生成的 `comments-config.ts` 文件包含了数据库注释的配置和执行函数：

```typescript
import { runPgComments } from './db/comments-config'

// 应用数据库注释
await runPgComments()
console.log('数据库注释已应用')
```

#### 使用 TypeBox 配置

生成的 `typebox.type.ts` 文件可以直接在 Elysia 应用中使用：

```typescript
import { Elysia } from 'elysia'
import { DbType } from './db/typebox.type'

const app = new Elysia()
  .post('/users', ({ body }) => {
    // body 会自动验证为 DbType.userSchema.insert 类型
    return { success: true }
  }, {
    body: DbType.userSchema.insert
  })
  .listen(3000)
```

### 4. 生成的文件结构

执行命令后，会在指定的数据库文件夹中生成以下文件结构：

```
db/
├── schema/
│   ├── index.ts              # Schema 索引文件
│   └── [your-schema-files]   # 原有的 schema 文件
├── comments-config.ts        # 注释配置文件
└── typebox.type.ts           # TypeBox 类型定义文件
```

#### Schema 索引文件 (`db/schema/index.ts`)

```typescript
/**
 * 自动生成的 Schema 导出文件
 * 请勿手动修改此文件
 */

export * from './user'
export * from './post'
// ... 其他 schema 文件

import * as userSchema from './user'
import * as postSchema from './post'
// ... 其他导入

export const dbSchema = {
  ...userSchema,
  ...postSchema,
  // ... 其他 schema
}
```

#### TypeBox 类型文件 (`db/typebox.type.ts`)

```typescript
/**
 * 自动生成的 TypeBox 配置文件
 * 基于 Schema 文件中的 JSDoc @typebox 注释生成
 * 请勿手动修改此文件
 */

import { t } from 'elysia'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { spreads } from './spreads'
import * as schema from './schema/index'

/**
 * 数据库 TypeBox 配置
 */
export const DbType = {
  abcchema: {
    insert: createInsertSchema(schema.abcchema, {
      // TypeBox 配置基于 JSDoc 注释自动生成
    }),
    select: createSelectSchema(schema.abcchema, {
      // TypeBox 配置基于 JSDoc 注释自动生成
    })
  }
}

export { spreads }
```

#### 注释配置文件 (`db/comments-config.ts`)

```typescript
/**
 * 自动生成的数据库注释配置文件
 * 基于 Schema 文件中的 JSDoc 注释生成
 * 请勿手动修改此文件
 */

import { Client } from 'pg'

/**
 * PostgreSQL 注释配置
 */
export function pgComments() {
  return [
    // 表注释
    `COMMENT ON TABLE "abcchema" IS 'Schema table';`,
    // 列注释会根据实际的 JSDoc 注释自动生成
  ]
}

/**
 * 执行 PostgreSQL 注释
 */
export async function runPgComments() {
  const client = new Client({
    // 数据库连接配置
  })
  
  try {
    await client.connect()
    const comments = pgComments()
    
    for (const comment of comments) {
      await client.query(comment)
    }
    
    console.log('数据库注释应用成功')
  } catch (error) {
    console.error('应用数据库注释时出错:', error)
  } finally {
    await client.end()
  }
}

// 如果直接运行此文件，则执行注释应用
if (require.main === module) {
  runPgComments()
}
```

## 配置选项

### CLI 参数

```bash
npx schema-typebox-gen db
```

- `db`: 固定参数，指定数据库文件夹名称。CLI 会在当前目录下的 `db` 文件夹中查找 schema 文件并生成相应的配置文件

### 生成器配置

工具会自动扫描指定文件夹中的 schema 文件，并根据以下规则生成文件：

- **Schema 文件扫描**: 自动查找 `.ts` 文件中的 `pgTable` 定义
- **注释解析**: 解析 JSDoc `@typebox` 注释中的 JSON 配置
- **文件生成**: 在指定文件夹中创建完整的文件结构

### 自定义配置

#### Schema 配置

可以通过修改生成的 `SchemaCollectorConfig` 来自定义行为：

```typescript
// 在生成的文件中可以找到这个配置
export interface SchemaCollectorConfig {
  /** 要扫描的文件扩展名 */
  extensions: string[]
  /** 要排除的文件模式 */
  excludePatterns: string[]
  /** 是否包含子目录 */
  includeSubdirectories: boolean
}
```

#### 注释配置

可以通过修改生成的注释配置文件来自定义数据库注释：

```typescript
// db/comments-config.ts
export function pgComments() {
  return [
    `COMMENT ON TABLE "users" IS '用户表';`,
    `COMMENT ON COLUMN "users"."id" IS '用户ID';`,
    `COMMENT ON COLUMN "users"."email" IS '邮箱地址';`,
    `COMMENT ON COLUMN "users"."name" IS '用户姓名';`,
    `COMMENT ON COLUMN "users"."age" IS '年龄';`
  ]
}
```

## JSDoc 注释格式

支持的 `@typebox` 注释格式：

```typescript
// 简单标记（生成空配置）
field: text('field'), // @typebox

// JSON 配置
email: text('email'), // @typebox { "format": "email" }
name: text('name'), // @typebox { "minLength": 2, "maxLength": 50 }
age: integer('age'), // @typebox { "minimum": 0, "maximum": 120 }
status: text('status'), // @typebox { "enum": ["active", "inactive"] }
```

## API 参考

### CLI 工具

#### main()

主要的 CLI 入口点，处理 `db` 文件夹的所有生成任务。

```typescript
import { main } from 'schema-typebox-generator'

// 直接调用主函数
await main()
```

### 核心类和接口

#### SchemaCollector

用于扫描和收集 schema 文件的类。

```typescript
import { SchemaCollector } from 'schema-typebox-generator'

const collector = new SchemaCollector({
  projectRoot: './db',
  schemaDir: './db/schema',
  outputDir: './db'
})

const schemas = await collector.collectSchemas()
```

#### CommentManager

用于管理数据库注释的类。

```typescript
import { CommentManager } from 'schema-typebox-generator'

const commentManager = new CommentManager()

// 生成注释配置内容
const content = commentManager.generateCommentConfigContent(schemas)

// 应用数据库注释（通过生成的配置文件）
// 请使用生成的 comments-config.ts 文件中的 runPgComments() 函数
```

### 工具函数

#### parseTypeBoxComment(comment: string)

解析 JSDoc 注释中的 TypeBox 配置。

```typescript
// 此函数为内部使用，通常不需要直接调用
// TypeBox 配置会在 CLI 运行时自动解析和生成
```

#### 生成文件函数

生成各种配置文件的函数都集成在 CLI 工具中：

```typescript
// 使用 CLI 工具自动生成所有文件
npx schema-typebox-gen db

// 或者在代码中调用
import { main } from 'schema-typebox-generator'
await main()
```

## 依赖要求

- Node.js >= 18
- TypeScript >= 5.0
- drizzle-orm >= 0.29.0
- drizzle-typebox >= 0.1.0

## 许可证

MIT