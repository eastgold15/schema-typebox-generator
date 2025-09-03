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
bun add schema-typebox-generator
# 或
npm install schema-typebox-generator
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
npx tsx src/cli.ts <db-folder-path>

# 示例：为 test-db 文件夹生成文件
npx tsx src/cli.ts test-db
```

这个命令会自动生成以下文件：
- `db/schema/index.ts` - Schema 索引文件，导出所有 schema
- `db/comments/comments-config.ts` - 注释配置文件
- `db/comments/comment.plugin.ts` - 注释插件文件
- `db/schema/database.types.ts` - TypeBox 类型定义文件
- `db/utils/dizzle.type.ts` - 工具函数文件

### 3. 使用生成的插件

#### 在 Elysia 应用中使用注释插件

```typescript
import { Elysia } from 'elysia'
import { commentPlugin } from './db/comments/comment.plugin'

const app = new Elysia()
  .use(commentPlugin)
  .listen(3000)

console.log('🦊 Elysia is running at http://localhost:3000')
```

#### 直接使用注释管理器

```typescript
import { CommentManager } from './db/comments/comment.plugin'

const commentManager = new CommentManager()

// 生成注释配置
const config = commentManager.generateCommentsConfig()
console.log('注释配置:', config)

// 应用数据库注释
await commentManager.applyComments()
console.log('数据库注释已应用')
```

### 4. 生成的文件结构

执行命令后，会在指定的数据库文件夹中生成以下文件结构：

```
db/
├── schema/
│   ├── index.ts              # Schema 索引文件
│   ├── database.types.ts     # TypeBox 类型定义
│   └── [your-schema-files]   # 原有的 schema 文件
├── comments/
│   ├── comments-config.ts    # 注释配置文件
│   └── comment.plugin.ts     # 注释插件文件
└── utils/
    └── dizzle.type.ts        # 工具函数文件
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

#### TypeBox 类型文件 (`db/schema/database.types.ts`)

```typescript
/**
 * 自动生成的 TypeBox 配置文件
 * 基于 Schema 文件中的 JSDoc @typebox 注释生成
 * 请勿手动修改此文件
 */

import { t } from 'elysia'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { spreads } from '../utils/dizzle.type'
import { dbSchema } from './index'

/**
 * 数据库 TypeBox 配置
 */
export const DbType = {
  typebox: {
    insert: {
      userSchema: createInsertSchema(dbSchema.userSchema, {
        email: t.String({ format: "email" }),
        name: t.String({ minLength: 2, maxLength: 50 }),
        age: t.Number({ minimum: 0, maximum: 120 }),
      }),
    },
    select: {
      userSchema: createSelectSchema(dbSchema.userSchema, {
        email: t.String({ format: "email" }),
        name: t.String({ minLength: 2, maxLength: 50 }),
        age: t.Number({ minimum: 0, maximum: 120 }),
      }),
    }
  }
}
```

#### 注释插件文件 (`db/comments/comment.plugin.ts`)

```typescript
import { Elysia } from 'elysia'
import { CommentManager } from '../../src/comment-plugin'

/**
 * 注释管理器实例
 */
const commentManager = new CommentManager()

/**
 * Elysia 注释插件
 */
export const commentPlugin = new Elysia({ name: 'comment-plugin' })
  .decorate('commentManager', commentManager)
  .onStart(async () => {
    console.log('🔧 正在应用数据库注释...')
    await commentManager.applyComments()
    console.log('✅ 数据库注释应用完成')
  })

export { CommentManager }
```

## 配置选项

### CLI 参数

```bash
npx tsx src/cli.ts <db-folder-path>
```

- `<db-folder-path>`: 数据库文件夹路径，CLI 会在此文件夹中查找 schema 文件并生成相应的配置文件

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
// db/comments/comments-config.ts
export const commentsConfig = {
  userSchema: {
    table: "用户表",
    columns: {
      id: "用户ID",
      email: "邮箱地址",
      name: "用户姓名",
      age: "年龄"
    }
  }
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

#### TypeBoxCLI.run(dbPath: string)

主要的 CLI 入口点，处理指定数据库文件夹的所有生成任务。

```typescript
import { TypeBoxCLI } from 'schema-typebox-generator'

const cli = new TypeBoxCLI()
await cli.run('./my-db-folder')
```

### 核心类和接口

#### SchemaCollector

用于扫描和收集 schema 文件的类。

```typescript
import { createSchemaCollector } from 'schema-typebox-generator'

const collector = createSchemaCollector({
  extensions: ['.ts'],
  excludePatterns: ['*.test.ts', '*.spec.ts'],
  includeSubdirectories: true
})

const schemas = await collector.scanSchemaFiles('./db/schema')
```

#### CommentManager

用于管理数据库注释的类。

```typescript
import { CommentManager } from 'schema-typebox-generator'

const commentManager = new CommentManager()

// 生成注释配置
const config = commentManager.generateCommentsConfig()

// 应用数据库注释
await commentManager.applyComments()
```

### 工具函数

#### parseTypeBoxComment(comment: string)

解析 JSDoc 注释中的 TypeBox 配置。

```typescript
import { parseTypeBoxComment } from 'schema-typebox-generator'

const config = parseTypeBoxComment('{ "format": "email" }')
// 返回: { format: "email" }
```

#### generateTypeBoxFile(outputPath: string, schemas: any[])

生成 TypeBox 配置文件。

```typescript
import { generateTypeBoxFile } from 'schema-typebox-generator'

await generateTypeBoxFile('./db/database.types.ts', schemas)
```

## 依赖要求

- Node.js >= 18
- TypeScript >= 5.0
- drizzle-orm >= 0.29.0
- drizzle-typebox >= 0.1.0

## 许可证

MIT