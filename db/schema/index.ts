/**
   * 自动生成的数据库 Schema 文件
   * 请勿手动修改此文件
   * 生成时间: 2025-09-03T05:15:25.196Z
   */

  import { abcchema } from './schema';

  export const dbSchema = {
  abcchema,
};
// 导出所有扫描到的数据库模式文件
export * from "./schema";

  /**
   * 数据库 Schema 类型
   */
  export type DbSchema = typeof dbSchema;

  /**
   * 所有表的名称列表
   */
  export const tableNames = ['abcchema'] as const;

  /**
   * 表名称类型
   */
  export type TableName = typeof tableNames[number];
