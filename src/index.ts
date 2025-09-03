// 统一的 Schema 收集器 - 核心功能
export {
  createSchemaCollector, defaultSchemaConfig, SchemaCollector, type SchemaCollectorConfig
} from './schema-collector';

// TypeBox 配置生成器
export {
  generateTypeBoxFile,
  type GeneratorConfig
} from './generator';

// 注释收集器
export {
  extractCommentText,
  parseTypeBoxComment, type CommentCollectionResult,
  type CommentCollectorConfig
} from './comment-collector';



// 统一 CLI
export { main as runTypeBoxCLI, TypeBoxCLI } from './cli';



// 库信息
export const VERSION = '2.0.0';

export const LIBRARY_INFO = {
  name: 'Schema TypeBox Generator',
  version: VERSION,
  description: '统一的数据库 Schema 和 TypeBox 生成工具库，支持自动收集表定义、生成配置文件和注释管理',
  features: [
    '统一的 Schema 收集器 - 自动扫描和收集数据库表定义',
    'TypeBox 配置生成器 - 从 schema 生成 TypeBox 验证配置',
    '注释收集器 - 收集和解析代码中的 @typebox 注释配置',
    '注释插件 - Elysia 插件，用于自动应用字段注释',
    '统一 CLI 工具 - 支持 generate、comments、parse 等命令'
  ],
  improvements: [
    '重构为统一的架构，所有工具共享 Schema 收集核心',
    '支持灵活的数据库文件夹结构 (db/schema/, db/sdb/)',
    '自动生成 schema 索引文件，简化导入管理',
    '统一的配置接口，支持命令行和配置文件两种方式'
  ]
};

/**
 * 显示库信息
 */
export function showLibraryInfo(): void {
  console.log(`\n🚀 ${LIBRARY_INFO.name} v${LIBRARY_INFO.version}`);
  console.log(`${LIBRARY_INFO.description}\n`);
  
  console.log('✨ 核心功能:');
  LIBRARY_INFO.features.forEach((feature, index) => {
    console.log(`  ${index + 1}. ${feature}`);
  });
  
  console.log('\n🔧 v2.0 重构改进:');
  LIBRARY_INFO.improvements.forEach((improvement, index) => {
    console.log(`  • ${improvement}`);
  });
  
  console.log('\n📖 使用方法:');
  console.log('  schema-gen generate <dbDir> [outputFile]  # 生成 TypeBox 配置');
  console.log('  schema-gen comments <dbDir> [outputFile]  # 生成注释配置');
  console.log('  schema-gen parse <schemaDir>             # 解析 schema 文件');
  console.log();
}