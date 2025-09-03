import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { Project, type SourceFile } from "ts-morph";

/**
 * Schema 收集器配置接口
 */
export interface SchemaCollectorConfig {
  /** 数据库文件所在目录 */
  dbDir: string;
  /** schema 文件所在目录（相对于dbDir） */
  schemaDir: string;
  /** 输出目录（相对于dbDir） */
  outputDir: string;
  /** 要排除的文件模式 */
  excludePatterns: string[];
  /** 要包含的表名模式（正则表达式字符串） */
  includeTablePatterns: string[];
  /** 要排除的表名模式（正则表达式字符串） */
  excludeTablePatterns: string[];
  /** 是否生成类型定义 */
  generateTypes: boolean;
  /** 是否生成表名列表 */
  generateTableNames: boolean;
  /** 自定义导入路径映射 */
  importPathMapping?: Record<string, string>;
}

/**
 * 默认配置
 */
export const defaultSchemaConfig: SchemaCollectorConfig = {
  dbDir: "src/db",
  schemaDir: "schema",
  outputDir: "schema",
  excludePatterns: [
    "**/generated-*.ts",
    "**/index.ts",
    "**/*.test.ts",
    "**/*.spec.ts",
  ],
  includeTablePatterns: [".*"], // 包含所有表
  excludeTablePatterns: [
    ".*Relations$", // 排除关系定义
    ".*Enum$", // 排除pgEnum枚举类型
  ],
  generateTypes: true,
  generateTableNames: true,
};

/**
 * 表定义信息
 */
export interface TableInfo {
  name: string;
  filePath: string;
  relativePath: string;
}

/**
 * Schema 收集器核心类
 * 负责扫描和收集数据库表定义，为其他工具提供基础数据
 */
export class SchemaCollector {
  private project: Project;
  private config: SchemaCollectorConfig;
  private absoluteDbDir: string;
  private absoluteSchemaDir: string;
  private absoluteOutputDir: string;

  constructor(config?: Partial<SchemaCollectorConfig>) {
    this.config = { ...defaultSchemaConfig, ...config };

    // 解析绝对路径
    this.absoluteDbDir = resolve(this.config.dbDir);
    this.absoluteSchemaDir = join(this.absoluteDbDir, this.config.schemaDir);
    this.absoluteOutputDir = join(this.absoluteDbDir, this.config.outputDir);

    this.project = new Project({
      tsConfigFilePath: "tsconfig.json",
    });
  }

  /**
   * 获取配置信息
   */
  public getConfig(): SchemaCollectorConfig {
    return { ...this.config };
  }

  /**
   * 获取绝对路径信息
   */
  public getPaths() {
    return {
      dbDir: this.absoluteDbDir,
      schemaDir: this.absoluteSchemaDir,
      outputDir: this.absoluteOutputDir,
    };
  }

  /**
   * 扫描指定目录下的所有 TypeScript 文件
   */
  private scanSchemaFiles(): SourceFile[] {
    const pattern = `${this.absoluteSchemaDir}/**/*.ts`;

    // 检查目录是否存在
    if (!existsSync(this.absoluteSchemaDir)) {
      return [];
    }

    try {
      // 先添加源文件到项目中
      this.project.addSourceFilesAtPaths(pattern);
      const sourceFiles = this.project.getSourceFiles();

      // 过滤出schema目录下的文件
      const schemaFiles = sourceFiles.filter(file => {
        const filePath = file.getFilePath().replace(/\\/g, '/');
        const normalizedSchemaDir = this.absoluteSchemaDir.replace(/\\/g, '/');
        return filePath.startsWith(normalizedSchemaDir);
      });

      // 过滤排除的文件
      const filteredFiles = schemaFiles.filter((file) => {
        const filePath = file.getFilePath();
        const shouldExclude = this.config.excludePatterns.some((pattern) => {
          const regex = new RegExp(pattern.replace(/\*/g, ".*"));
          return regex.test(filePath);
        });
        return !shouldExclude;
      });

      return filteredFiles;
    } catch (error) {
      console.error('扫描文件时出错:', error);
      return [];
    }
  }

  /**
   * 从源文件中提取 pgTable 定义的变量
   */
  private extractPgTableVariables(sourceFile: SourceFile): TableInfo[] {
    const tables: TableInfo[] = [];

    // 查找所有变量声明
    const variableDeclarations = sourceFile.getVariableDeclarations();

    for (const declaration of variableDeclarations) {
      const initializer = declaration.getInitializer();

      if (initializer) {
        const initializerText = initializer.getText();

        // 检查是否是 pgTable 调用
        if (initializerText.includes("pgTable(")) {
          const variableName = declaration.getName();

          // 检查表名是否符合包含/排除模式
          if (this.shouldIncludeTable(variableName)) {
            const filePath = sourceFile.getFilePath();
            const relativePath = this.getRelativeImportPath(filePath);
            tables.push({
              name: variableName,
              filePath,
              relativePath,
            });
            console.log(`发现表定义: ${variableName} 在 ${filePath}`);
          } else {
            console.log(`跳过表定义: ${variableName} (不符合过滤条件)`);
          }
        }
      }
    }
    return tables;
  }

  /**
   * 检查表名是否应该包含
   */
  private shouldIncludeTable(tableName: string): boolean {
    // 检查排除模式
    for (const pattern of this.config.excludeTablePatterns) {
      if (new RegExp(pattern).test(tableName)) {
        return false;
      }
    }
    // 检查包含模式
    for (const pattern of this.config.includeTablePatterns) {
      if (new RegExp(pattern).test(tableName)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取相对导入路径
   */
  private getRelativeImportPath(filePath: string): string {
    // 检查是否有自定义映射
    const normalizedPath = filePath.replace(/\\/g, "/");
    for (const [sourcePath, targetPath] of Object.entries(
      this.config.importPathMapping || {},
    )) {
      if (normalizedPath.includes(sourcePath)) {
        return targetPath;
      }
    }

    let relativePath = relative(this.absoluteOutputDir, filePath)
      .replace(/\\/g, "/")
      .replace(/\.ts$/, "");

    // 确保相对路径以 ./ 或 ../ 开头
    if (!relativePath.startsWith(".")) {
      relativePath = `./${relativePath}`;
    }
    return relativePath;
  }

  /**
   * 收集所有表定义信息
   */
  public async collectTables(): Promise<TableInfo[]> {
    console.log("开始扫描 pgTable 定义...");
    console.log(`Schema 目录: ${this.absoluteSchemaDir}`);

    // 扫描所有 schema 文件
    const sourceFiles = this.scanSchemaFiles();
    console.log(`找到 ${sourceFiles.length} 个 schema 文件`);

    // 提取所有表定义
    const allTables: TableInfo[] = [];
    for (const sourceFile of sourceFiles) {
      // 跳过生成的文件
      if (sourceFile.getFilePath().includes("generated-") ||
        sourceFile.getFilePath().includes("/sdb/")) {
        continue;
      }

      const tables = this.extractPgTableVariables(sourceFile);
      allTables.push(...tables);
    }

    console.log(`总共找到 ${allTables.length} 个表定义`);
    return allTables;
  }

  /**
   * 生成 dbSchema 文件内容
   */
  private generateSchemaContent(tables: TableInfo[]): string {
    // 按文件分组导入
    const importsByFile = new Map<string, string[]>();
    for (const table of tables) {
      const imports = importsByFile.get(table.relativePath) || [];
      imports.push(table.name);
      importsByFile.set(table.relativePath, imports);
    }

    // 生成导入语句
    const imports = Array.from(importsByFile.entries())
      .map(([path, tableNames]) => {
        return `import { ${tableNames.join(", ")} } from '${path}';`;
      })
      .join("\n");

    // 生成 dbSchema 对象
    const tableNames = tables.map((t) => t.name);
    const schemaObject = `export const dbSchema = {\n${tableNames.map((name) => `  ${name},`).join("\n")}\n};`;

    // 动态生成所有扫描到的文件的导出语句
    const uniqueFiles = Array.from(new Set(tables.map((t) => t.relativePath)));
    const dynamicExports =
      uniqueFiles.length > 0
        ? `\n// 导出所有扫描到的数据库模式文件\n${uniqueFiles.map((path) => `export * from "${path}";`).join("\n")}`
        : "";

    let content = `/**
   * 自动生成的数据库 Schema 文件
   * 请勿手动修改此文件
   * 生成时间: ${new Date().toISOString()}
   */

  ${imports}

  ${schemaObject}${dynamicExports}`;

    // 根据配置添加类型定义
    if (this.config.generateTypes) {
      content += `

  /**
   * 数据库 Schema 类型
   */
  export type DbSchema = typeof dbSchema;`;
    }

    // 根据配置添加表名列表
    if (this.config.generateTableNames) {
      content += `

  /**
   * 所有表的名称列表
   */
  export const tableNames = [${tableNames.map((name) => `'${name}'`).join(", ")}] as const;

  /**
   * 表名称类型
   */
  export type TableName = typeof tableNames[number];`;
    }

    return `${content}\n`;
  }

  /**
   * 确保输出目录存在
   */
  private ensureOutputDirectory(): void {
    if (!existsSync(this.absoluteOutputDir)) {
      mkdirSync(this.absoluteOutputDir, { recursive: true });
    }
  }

  /**
   * 生成 schema 索引文件
   */
  public async generateSchemaIndex(tables?: TableInfo[]): Promise<string> {
    if (!tables) {
      tables = await this.collectTables();
    }

    if (tables.length === 0) {
      console.warn("未找到任何 pgTable 定义");
      return "";
    }

    // 生成文件内容
    const content = this.generateSchemaContent(tables);

    // 确保输出目录存在
    this.ensureOutputDirectory();

    // 写入文件
    const outputFile = join(this.absoluteOutputDir, "index.ts");
    writeFileSync(outputFile, content, "utf-8");

    console.log(`✅ 成功生成 dbSchema 文件: ${outputFile}`);
    console.log(`包含以下表: ${tables.map((t) => t.name).join(", ")}`);

    return outputFile;
  }

  /**
   * 获取输出文件路径
   */
  public getOutputPath(filename: string): string {
    // 确保输出目录存在
    this.ensureOutputDirectory();
    return join(this.absoluteOutputDir, filename);
  }

  /**
   * 生成schema目录的统一导出文件
   */
  public async generateSchemaExports(tables?: TableInfo[]): Promise<string> {
    if (!tables) {
      tables = await this.collectTables();
    }

    if (tables.length === 0) {
      console.warn("未找到任何 pgTable 定义");
      return "";
    }

    // 按文件分组导入
    const importsByFile = new Map<string, string[]>();
    for (const table of tables) {
      // 计算相对于schema目录的路径
      let relativePath = relative(this.absoluteSchemaDir, table.filePath)
        .replace(/\\/g, "/")
        .replace(/\.ts$/, "");

      // 确保相对路径以 ./ 开头
      if (!relativePath.startsWith(".")) {
        relativePath = `./${relativePath}`;
      }

      const imports = importsByFile.get(relativePath) || [];
      imports.push(table.name);
      importsByFile.set(relativePath, imports);
    }

    // 生成导入语句
    const imports = Array.from(importsByFile.entries())
      .map(([path, tableNames]) => {
        return `import { ${tableNames.join(", ")} } from '${path}';`;
      })
      .join("\n");

    // 生成 dbSchema 对象
    const tableNames = tables.map((t) => t.name);
    const schemaObject = `export const dbSchema = {\n${tableNames.map((name) => `  ${name},`).join("\n")}\n}`;

    // 生成导出语句
    const uniqueFiles = Array.from(new Set(Array.from(importsByFile.keys())));
    const dynamicExports = uniqueFiles.length > 0
      ? `// 导出所有扫描到的数据库模式文件\n${uniqueFiles.map((path) => `export * from "${path}";`).join("\n")}`
      : "";

    const content = `/**
 * 自动生成的数据库 Schema 文件
 * 请勿手动修改此文件，运行 \`bun run generate:schema\` 重新生成
 * 生成时间: ${new Date().toISOString()}
 */

${imports}

${schemaObject};
${dynamicExports}

/**
 * 数据库 Schema 类型
 */
export type DbSchema = typeof dbSchema;

/**
 * 所有表的名称列表
 */
export const tableNames = [${tableNames.map((name) => `'${name}'`).join(", ")}] as const;

/**
 * 表名称类型
 */
export type TableName = typeof tableNames[number];
`;

    // 确保schema目录存在
    if (!existsSync(this.absoluteSchemaDir)) {
      mkdirSync(this.absoluteSchemaDir, { recursive: true });
    }

    // 写入文件到schema目录
    const outputFile = join(this.absoluteSchemaDir, "index.ts");
    writeFileSync(outputFile, content, "utf-8");

    console.log(`✅ 成功生成 schema 导出文件: ${outputFile}`);
    console.log(`包含以下表: ${tables.map((t) => t.name).join(", ")}`);

    return outputFile;
  }
}

/**
 * 创建 Schema 收集器实例
 */
export function createSchemaCollector(config?: Partial<SchemaCollectorConfig>): SchemaCollector {
  return new SchemaCollector(config);
}