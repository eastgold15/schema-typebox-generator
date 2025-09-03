import { getTableColumns, getTableName, sql, type Table } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as fs from 'fs';
import * as path from 'path';
import { parseSchemaFilesWithComments } from './parser.js';

type ColumnComments<T extends Table> = {
  [K in keyof T["_"]["columns"]]: string;
};

/**
 * 字段注释信息接口
 */
export interface FieldCommentInfo {
  comment: string         // 普通注释内容
  typeboxConfig: any      // @typebox 配置
}

/**
 * 表字段信息接口
 */
export interface TableFieldsInfo {
  [fieldName: string]: FieldCommentInfo
}

/**
 * 注释配置接口
 */
export interface CommentConfig {
  [tableName: string]: {
    [fieldName: string]: string
  }
}

/**
 * 注释管理器类
 */
export class CommentManager {
  private comments: [Table, ColumnComments<Table>][] = [];

  /**
   * 添加注释到指定表的列
   *
   * @param table 要添加注释的表
   * @param columnComments 要添加到表的列注释
   */
  pgComments<T extends Table>(
    table: T,
    columnComments: ColumnComments<T>,
  ) {
    this.comments.push([table, columnComments]);
  }

  /**
   * 从schema文件自动生成注释配置
   *
   * @param schemaDir schema文件目录
   * @returns 注释配置对象
   */
  async generateCommentsFromSchema(schemaDir: string): Promise<CommentConfig> {
    const config: CommentConfig = {};

    try {
      // 解析schema文件获取完整的字段注释信息
      const tablesInfo = await parseSchemaFilesWithComments(schemaDir);

      // 遍历每个表的字段信息
      for (const [tableName, fieldsInfo] of Object.entries(tablesInfo)) {
        config[tableName] = {};

        // 遍历每个字段的注释信息
        for (const [fieldName, fieldInfo] of Object.entries(fieldsInfo)) {
          // 无论字段是否有注释都添加到配置中，没有注释则设置为空字符串
          config[tableName][fieldName] = fieldInfo.comment?.trim() ?? '';
        }
      }
    } catch (error) {
      console.warn('生成注释配置时出错:', error);
    }

    return config;
  }

  /**
   * 生成注释配置文件
   *
   * @param schemaDir schema文件目录
   * @param outputPath 输出文件路径
   */
  async generateCommentConfigFile(schemaDir: string, outputPath: string): Promise<void> {
    const config = await this.generateCommentsFromSchema(schemaDir)

    // 生成配置文件内容
    const configContent = this.generateCommentConfigContent(config)

    // 确保输出目录存在
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 写入文件
    fs.writeFileSync(outputPath, configContent, 'utf-8')
    console.log(`✅ 注释配置文件已生成: ${outputPath}`)
  }

  /**
   * 生成注释配置文件内容
   *
   * @param config 注释配置对象
   * @returns 配置文件内容
   */
  private generateCommentConfigContent(config: CommentConfig): string {
    const imports = [
      '/**',
      ' * 自动生成的数据库注释配置文件',
      ' * 基于 Schema 文件中的注释生成',
      ' * 请勿手动修改此文件',
      ' */',
      '',
      'import { getTableColumns, getTableName, sql, type Table } from "drizzle-orm";',
      'import { dbSchema } from "../schema/index";',
      'import { db } from "../connection";',
      '',

    ];

    const type = [
      'type ColumnComments<T extends Table> = {',
      '  [K in keyof T["_"]["columns"]]: string;',
      '};',

      '',
      'const comments: [Table, ColumnComments<Table>][] = [];',
      '',
    ]

    const pgComments = [
      '/**',
      ' * 添加注释到指定表的列',
      ' *',
      ' * @param table 要添加注释的表',
      ' * @param columnComments 要添加到表的列注释',
      ' */',
      'export function pgComments<T extends Table>(',
      '  table: T,',
      '  columnComments: ColumnComments<T>,',
      ') {',
      '  comments.push([table, columnComments]);',
      '}',
      '',
    ]

    const runPgComments = [
      '/**',
      ' * 运行添加注释的SQL命令',
      ' */',
      'export async function runPgComments(db: any) {',
      '  function escapeIdentifier(identifier: string): string {',
      '    return `"${identifier.replace(/"/g, \'""\')}"`;',
      '  }',
      '  function escapeString(str: string): string {',
      '    return `\'${str.replace(/\'/g, "\'\'")}\'`;',
      '  }',
      '',
      '  await db.transaction(async (tx: any) => {',
      '    for (const [table, columnComments] of comments) {',
      '      for (const [columnName, comment] of Object.entries(columnComments)) {',
      '        const column = getTableColumns(table)[columnName];',
      '',
      '        // 预处理语句不适用于COMMENT ON COLUMN',
      '        // 以下行会抛出 `syntax error at or near "$1"`',
      '        // await tx.execute(sql`COMMENT ON COLUMN ${column} IS ${comment}`);',
      '',
      '        // 所以我们必须使用原始SQL',
      '        const escapedQuery = sql.raw(',
      '          `COMMENT ON COLUMN ${escapeIdentifier(getTableName(table))}.${escapeIdentifier(column?.name)} IS ${escapeString(comment)}`',
      '        );',
      '        await tx.execute(escapedQuery);',
      '      }',
      '    }',
      '  });',
      '  console.log("列注释添加成功");',
      '}',
      '',
    ]

    const dbComments = [
      '/**',
      ' * 数据库注释配置',
      ' */',
      'export const dbComments = {'

    ]

    const tableConfigs: string[] = []
    for (const [tableName, fieldComments] of Object.entries(config)) {
      if (Object.keys(fieldComments).length === 0) continue

      const fieldEntries = Object.entries(fieldComments)
        .map(([fieldName, comment]) => `    ${fieldName}: ${JSON.stringify(comment)}`)
        .join(',\n')

      tableConfigs.push(`  ${tableName}: {\n${fieldEntries}\n  }`)
    }

    const content = [
      ...imports,
      ...type,
      ...pgComments,
      ...runPgComments,
      ...dbComments,
      ...(tableConfigs.length > 0 ? tableConfigs.map((config, index) =>
        index === tableConfigs.length - 1 ? config : config + ','
      ) : []),
      '} as const',
      '',
      '/**',
      ' * 应用数据库注释',
      ' * 在数据库迁移后调用此函数来添加注释',
      ' */',
      'export function applyDbComments(db: any) {',
      ...Object.keys(config).map(tableName =>
        `  pgComments(dbSchema.${tableName}, dbComments.${tableName});`
      ),
      '',
      '  return runPgComments(db);',
      '}',
      'applyDbComments(db)'
    ]

    return content.join('\n')
  }
}

