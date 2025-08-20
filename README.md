# Schema TypeBox Generator

自动从 Drizzle Schema 文件中解析 JSDoc `@typebox` 注释并生成 TypeBox 配置的工具库。

## 特性

- 🔍 **自动解析**: 从 Drizzle Schema 文件中自动解析 `@typebox` JSDoc 注释
- 📝 **代码生成**: 生成完整的 TypeBox 配置文件
- 🔄 **监听模式**: 支持文件变化自动重新生成
- 🛠️ **CLI 工具**: 提供命令行工具，方便集成到构建流程
- ⚙️ **可配置**: 支持手动配置覆盖和自定义选项

## 安装

```bash
bun add schema-typebox-generator
# 或
npm install schema-typebox-generator
```

## 使用方法

### 1. 在 Schema 文件中添加 JSDoc 注释

```typescript
// src/db/schema/user.ts
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

### 2. 使用 CLI 工具生成配置

```bash
# 生成配置文件
schema-typebox-gen generate ./src/db/schema ./src/db/database.types.ts

# 监听模式（文件变化时自动重新生成）
schema-typebox-gen watch ./src/db/schema ./src/db/database.types.ts

# 仅解析配置（不生成文件）
schema-typebox-gen parse ./src/db/schema
```

### 3. 在代码中使用

```typescript
import { generate, watch, parseConfig } from 'schema-typebox-generator'

// 生成配置文件
await generate('./src/db/schema', './src/db/database.types.ts')

// 监听模式
await watch('./src/db/schema', './src/db/database.types.ts')

// 仅解析配置
const config = await parseConfig('./src/db/schema')
console.log(config)
```

### 4. 生成的文件示例

生成的 `database.types.ts` 文件：

```typescript
/**
 * 自动生成的 TypeBox 配置文件
 * 基于 Schema 文件中的 JSDoc @typebox 注释生成
 * 请勿手动修改此文件
 */

import { t } from 'elysia'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { dbSchema, tableNames } from './generated-schema.js'

/**
 * JSDoc 解析的 TypeBox 配置
 */
export const jsdocConfig = {
  "userSchema": {
    "insert": {
      "email": { "format": "email" },
      "name": { "minLength": 2, "maxLength": 50 },
      "age": { "minimum": 0, "maximum": 120 },
      "createdAt": {},
      "updatedAt": {}
    },
    "select": {
      "email": { "format": "email" },
      "name": { "minLength": 2, "maxLength": 50 },
      "age": { "minimum": 0, "maximum": 120 },
      "createdAt": {},
      "updatedAt": {}
    }
  }
} as const

/**
 * 合并后的 Schema 自定义配置
 */
export const schemaCustomizations = {
  userSchema: {
    insert: {
      email: t.String({"format":"email"}),
      name: t.String({"minLength":2,"maxLength":50}),
      age: t.Number({"minimum":0,"maximum":120}),
      createdAt: t.String({}),
      updatedAt: t.String({}),
    },
    select: {
      email: t.String({"format":"email"}),
      name: t.String({"minLength":2,"maxLength":50}),
      age: t.Number({"minimum":0,"maximum":120}),
      createdAt: t.String({}),
      updatedAt: t.String({}),
    }
  },
} as const

/**
 * 动态生成 TypeBox 配置
 */
export function generateTypeBoxSchemas() {
  const typeboxSchemas: any = { insert: {}, select: {} }

  // 遍历所有表名，动态生成 schema
  for (const tableName of tableNames) {
    const tableSchema = (dbSchema as any)[tableName]
    if (!tableSchema) continue

    const customizations = schemaCustomizations[tableName as keyof typeof schemaCustomizations] || { insert: {}, select: {} }

    // 生成 insert schema
    typeboxSchemas.insert[tableName] = createInsertSchema(tableSchema, customizations.insert || {})

    // 生成 select schema
    typeboxSchemas.select[tableName] = createSelectSchema(tableSchema, customizations.select || {})
  }

  return typeboxSchemas
}

/**
 * 导出生成的 TypeBox Schemas
 */
export const schemas = generateTypeBoxSchemas()
```

## 配置选项

### GeneratorConfig

```typescript
interface GeneratorConfig {
  /** Schema 文件夹路径 */
  schemaDir: string
  /** 输出文件路径 */
  outputPath: string
  /** 手动配置覆盖 */
  manualConfig?: Record<string, any>
  /** 是否包含 Elysia 相关代码 */
  includeElysia?: boolean
}
```

### 使用配置文件

创建 `schema-gen.config.js`：

```javascript
export default {
  schemaDir: './src/db/schema',
  outputPath: './src/db/database.types.ts',
  includeElysia: true,
  manualConfig: {
    userSchema: {
      insert: {
        password: 't.String({ minLength: 8 })'
      }
    }
  }
}
```

然后使用：

```bash
schema-typebox-gen generate --config ./schema-gen.config.js
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

### generate(schemaDir, outputPath, options?)

生成 TypeBox 配置文件。

### watch(schemaDir, outputPath, options?)

监听模式，文件变化时自动重新生成。

### parseConfig(schemaDir)

仅解析配置，返回解析结果，不生成文件。

## 依赖要求

- Node.js >= 18
- TypeScript >= 5.0
- drizzle-orm >= 0.29.0
- drizzle-typebox >= 0.1.0

## 许可证

MIT