/**
 * 自动生成的数据库注释配置文件
 * 基于 Schema 文件中的注释生成
 * 请勿手动修改此文件
 */

import { getTableColumns, getTableName, sql, type Table } from "drizzle-orm";
import { dbSchema } from "../schema/index";

type ColumnComments<T extends Table> = {
  [K in keyof T["_"]["columns"]]: string;
};

const comments: [Table, ColumnComments<Table>][] = [];

/**
 * 添加注释到指定表的列
 *
 * @param table 要添加注释的表
 * @param columnComments 要添加到表的列注释
 */
export function pgComments<T extends Table>(
  table: T,
  columnComments: ColumnComments<T>,
) {
  comments.push([table, columnComments]);
}

/**
 * 运行添加注释的SQL命令
 */
export async function runPgComments(db: any) {
  function escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }
  function escapeString(str: string): string {
    return `'${str.replace(/'/g, "''")}'`;
  }

  await db.transaction(async (tx: any) => {
    for (const [table, columnComments] of comments) {
      for (const [columnName, comment] of Object.entries(columnComments)) {
        const column = getTableColumns(table)[columnName];

        // 预处理语句不适用于COMMENT ON COLUMN
        // 以下行会抛出 `syntax error at or near "$1"`
        // await tx.execute(sql`COMMENT ON COLUMN ${column} IS ${comment}`);

        // 所以我们必须使用原始SQL
        const escapedQuery = sql.raw(
          `COMMENT ON COLUMN ${escapeIdentifier(getTableName(table))}.${escapeIdentifier(column?.name)} IS ${escapeString(comment)}`
        );
        await tx.execute(escapedQuery);
      }
    }
  });
  console.log("列注释添加成功");
}

/**
 * 数据库注释配置
 */
export const dbComments = {
  abcchema: {
    id: "主键",
    username: "",
    password: "OAuth用户可能没有密码",
    email: "邮箱",
    phone: "手机号",
    nickname: "",
    avatar: "",
    role: "user, admin",
    abctate: "active, inactive",
    googleId: "OAuth 相关字段 Google OAuth ID",
    createdAt: "",
    updatedAt: ""
  }
} as const

/**
 * 应用数据库注释
 * 在数据库迁移后调用此函数来添加注释
 */
export function applyDbComments(db: any) {
  pgComments(dbSchema.abcchema, dbComments.abcchema);

  return runPgComments(db);
}