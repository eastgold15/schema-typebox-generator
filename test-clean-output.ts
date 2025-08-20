/**
 * 自动生成的 TypeBox 配置文件
 * 基于 Schema 文件中的 JSDoc @typebox 注释生成
 * 请勿手动修改此文件
 */

import { t } from 'elysia'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { spreads } from './dizzle.type.js'
import { dbSchema, tableNames } from './generated-schema.js'

/**
 * 数据库 TypeBox 配置
 */
export const DbType = {
  typebox: {
    insert: {
      testSchema: createInsertSchema(dbSchema.testSchema, {
        email: t.String({"format":"email"}),
        name: t.String({"minLength":2,"maxLength":50}),
        status: {"enum":{"0":"\"active\"","1":"\"inactive\""}}
      }),
      categoriesSchema: createInsertSchema(dbSchema.categoriesSchema, {
        name: t.String({"minLength":1,"maxLength":100}),
        slug: t.String({"format":"slug","minLength":1,"maxLength":100}),
        sortOrder: t.Number({"default":0}),
        isVisible: t.Boolean({"default":true})
      }),
      productsSchema: createInsertSchema(dbSchema.productsSchema, {
        name: t.String({"minLength":1,"maxLength":255}),
        slug: t.String({"format":"slug","minLength":1,"maxLength":255}),
        price: t.Number({"minimum":0}),
        comparePrice: t.Number({"minimum":0}),
        cost: t.Number({"minimum":0}),
        sku: t.String({"maxLength":100}),
        barcode: t.String({"maxLength":100}),
        weight: t.Number({"minimum":0}),
        stock: t.Number({"default":0,"minimum":0}),
        minStock: t.Number({"default":0,"minimum":0}),
        isActive: t.Boolean({"default":true}),
        isFeatured: t.Boolean({"default":false}),
        metaTitle: t.String({"maxLength":255}),
        metaKeywords: t.String({"maxLength":500})
      }),
      reviewsSchema: createInsertSchema(dbSchema.reviewsSchema, {
        userName: t.String({"minLength":1,"maxLength":100}),
        userEmail: t.String({"format":"email","maxLength":255}),
        rating: t.Number({"minimum":1,"maximum":5}),
        title: t.String({"maxLength":255}),
        content: t.String({"minLength":1}),
        isVerified: t.Boolean({"default":false}),
        isApproved: t.Boolean({"default":false})
      }),
      siteConfigSchema: createInsertSchema(dbSchema.siteConfigSchema, {
        key: t.String({"minLength":1,"maxLength":100}),
        category: t.String({"default":"general","maxLength":50})
      }),
      advertisementsSchema: createInsertSchema(dbSchema.advertisementsSchema, {
        title: t.String({"minLength":1,"maxLength":255}),
        type: t.String({"enum":["banner","carousel"],"maxLength":50}),
        image: t.String({"minLength":1}),
        link: t.String({"format":"uri","maxLength":500}),
        position: t.String({"maxLength":100}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true})
      }),
      headerConfigSchema: createInsertSchema(dbSchema.headerConfigSchema, {
        shippingText: t.String({"default":"FREE SHIPPING on orders over $59* details","maxLength":200}),
        trackOrderText: t.String({"default":"Track Order","maxLength":100}),
        helpText: t.String({"default":"Help","maxLength":100}),
        trackOrderUrl: t.String({"default":"#","maxLength":255}),
        helpUrl: t.String({"default":"#","maxLength":255}),
        isActive: t.Boolean({"default":true})
      }),
      footerConfigSchema: createInsertSchema(dbSchema.footerConfigSchema, {
        sectionTitle: t.String({"minLength":1,"maxLength":100}),
        linkText: t.String({"minLength":1,"maxLength":100}),
        linkUrl: t.String({"minLength":1,"maxLength":255}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true})
      }),
      userProfile: createInsertSchema(dbSchema.userProfile, {
        email: t.String({"format":"email"}),
        displayName: t.String({"minLength":2,"maxLength":50})
      }),
      productCatalog: createInsertSchema(dbSchema.productCatalog, {
        title: t.String({"minLength":1,"maxLength":100}),
        price: t.Number({"minimum":0})
      }),
    },
    select: {
      testSchema: createSelectSchema(dbSchema.testSchema, {
        email: t.String({"format":"email"}),
        name: t.String({"minLength":2,"maxLength":50}),
        status: {"enum":{"0":"\"active\"","1":"\"inactive\""}}
      }),
      categoriesSchema: createSelectSchema(dbSchema.categoriesSchema, {
        name: t.String({"minLength":1,"maxLength":100}),
        slug: t.String({"format":"slug","minLength":1,"maxLength":100}),
        sortOrder: t.Number({"default":0}),
        isVisible: t.Boolean({"default":true})
      }),
      productsSchema: createSelectSchema(dbSchema.productsSchema, {
        name: t.String({"minLength":1,"maxLength":255}),
        slug: t.String({"format":"slug","minLength":1,"maxLength":255}),
        price: t.Number({"minimum":0}),
        comparePrice: t.Number({"minimum":0}),
        cost: t.Number({"minimum":0}),
        sku: t.String({"maxLength":100}),
        barcode: t.String({"maxLength":100}),
        weight: t.Number({"minimum":0}),
        stock: t.Number({"default":0,"minimum":0}),
        minStock: t.Number({"default":0,"minimum":0}),
        isActive: t.Boolean({"default":true}),
        isFeatured: t.Boolean({"default":false}),
        metaTitle: t.String({"maxLength":255}),
        metaKeywords: t.String({"maxLength":500})
      }),
      reviewsSchema: createSelectSchema(dbSchema.reviewsSchema, {
        userName: t.String({"minLength":1,"maxLength":100}),
        userEmail: t.String({"format":"email","maxLength":255}),
        rating: t.Number({"minimum":1,"maximum":5}),
        title: t.String({"maxLength":255}),
        content: t.String({"minLength":1}),
        isVerified: t.Boolean({"default":false}),
        isApproved: t.Boolean({"default":false})
      }),
      siteConfigSchema: createSelectSchema(dbSchema.siteConfigSchema, {
        key: t.String({"minLength":1,"maxLength":100}),
        category: t.String({"default":"general","maxLength":50})
      }),
      advertisementsSchema: createSelectSchema(dbSchema.advertisementsSchema, {
        title: t.String({"minLength":1,"maxLength":255}),
        type: t.String({"enum":["banner","carousel"],"maxLength":50}),
        image: t.String({"minLength":1}),
        link: t.String({"format":"uri","maxLength":500}),
        position: t.String({"maxLength":100}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true})
      }),
      headerConfigSchema: createSelectSchema(dbSchema.headerConfigSchema, {
        shippingText: t.String({"default":"FREE SHIPPING on orders over $59* details","maxLength":200}),
        trackOrderText: t.String({"default":"Track Order","maxLength":100}),
        helpText: t.String({"default":"Help","maxLength":100}),
        trackOrderUrl: t.String({"default":"#","maxLength":255}),
        helpUrl: t.String({"default":"#","maxLength":255}),
        isActive: t.Boolean({"default":true})
      }),
      footerConfigSchema: createSelectSchema(dbSchema.footerConfigSchema, {
        sectionTitle: t.String({"minLength":1,"maxLength":100}),
        linkText: t.String({"minLength":1,"maxLength":100}),
        linkUrl: t.String({"minLength":1,"maxLength":255}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true})
      }),
      userProfile: createSelectSchema(dbSchema.userProfile, {
        email: t.String({"format":"email"}),
        displayName: t.String({"minLength":2,"maxLength":50})
      }),
      productCatalog: createSelectSchema(dbSchema.productCatalog, {
        title: t.String({"minLength":1,"maxLength":100}),
        price: t.Number({"minimum":0})
      }),
    }
  },
  spreads: {
    insert: spreads({
      testSchema: createInsertSchema(dbSchema.testSchema, {
        email: t.String({"format":"email"}),
        name: t.String({"minLength":2,"maxLength":50}),
        status: {"enum":{"0":"\"active\"","1":"\"inactive\""}}
      }),
      categoriesSchema: createInsertSchema(dbSchema.categoriesSchema, {
        name: t.String({"minLength":1,"maxLength":100}),
        slug: t.String({"format":"slug","minLength":1,"maxLength":100}),
        sortOrder: t.Number({"default":0}),
        isVisible: t.Boolean({"default":true})
      }),
      productsSchema: createInsertSchema(dbSchema.productsSchema, {
        name: t.String({"minLength":1,"maxLength":255}),
        slug: t.String({"format":"slug","minLength":1,"maxLength":255}),
        price: t.Number({"minimum":0}),
        comparePrice: t.Number({"minimum":0}),
        cost: t.Number({"minimum":0}),
        sku: t.String({"maxLength":100}),
        barcode: t.String({"maxLength":100}),
        weight: t.Number({"minimum":0}),
        stock: t.Number({"default":0,"minimum":0}),
        minStock: t.Number({"default":0,"minimum":0}),
        isActive: t.Boolean({"default":true}),
        isFeatured: t.Boolean({"default":false}),
        metaTitle: t.String({"maxLength":255}),
        metaKeywords: t.String({"maxLength":500})
      }),
      reviewsSchema: createInsertSchema(dbSchema.reviewsSchema, {
        userName: t.String({"minLength":1,"maxLength":100}),
        userEmail: t.String({"format":"email","maxLength":255}),
        rating: t.Number({"minimum":1,"maximum":5}),
        title: t.String({"maxLength":255}),
        content: t.String({"minLength":1}),
        isVerified: t.Boolean({"default":false}),
        isApproved: t.Boolean({"default":false})
      }),
      siteConfigSchema: createInsertSchema(dbSchema.siteConfigSchema, {
        key: t.String({"minLength":1,"maxLength":100}),
        category: t.String({"default":"general","maxLength":50})
      }),
      advertisementsSchema: createInsertSchema(dbSchema.advertisementsSchema, {
        title: t.String({"minLength":1,"maxLength":255}),
        type: t.String({"enum":["banner","carousel"],"maxLength":50}),
        image: t.String({"minLength":1}),
        link: t.String({"format":"uri","maxLength":500}),
        position: t.String({"maxLength":100}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true})
      }),
      headerConfigSchema: createInsertSchema(dbSchema.headerConfigSchema, {
        shippingText: t.String({"default":"FREE SHIPPING on orders over $59* details","maxLength":200}),
        trackOrderText: t.String({"default":"Track Order","maxLength":100}),
        helpText: t.String({"default":"Help","maxLength":100}),
        trackOrderUrl: t.String({"default":"#","maxLength":255}),
        helpUrl: t.String({"default":"#","maxLength":255}),
        isActive: t.Boolean({"default":true})
      }),
      footerConfigSchema: createInsertSchema(dbSchema.footerConfigSchema, {
        sectionTitle: t.String({"minLength":1,"maxLength":100}),
        linkText: t.String({"minLength":1,"maxLength":100}),
        linkUrl: t.String({"minLength":1,"maxLength":255}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true})
      }),
      userProfile: createInsertSchema(dbSchema.userProfile, {
        email: t.String({"format":"email"}),
        displayName: t.String({"minLength":2,"maxLength":50})
      }),
      productCatalog: createInsertSchema(dbSchema.productCatalog, {
        title: t.String({"minLength":1,"maxLength":100}),
        price: t.Number({"minimum":0})
      }),
    }, 'insert'),
    select: spreads({
      testSchema: createSelectSchema(dbSchema.testSchema, {
        email: t.String({"format":"email"}),
        name: t.String({"minLength":2,"maxLength":50}),
        status: {"enum":{"0":"\"active\"","1":"\"inactive\""}}
      }),
      categoriesSchema: createSelectSchema(dbSchema.categoriesSchema, {
        name: t.String({"minLength":1,"maxLength":100}),
        slug: t.String({"format":"slug","minLength":1,"maxLength":100}),
        sortOrder: t.Number({"default":0}),
        isVisible: t.Boolean({"default":true})
      }),
      productsSchema: createSelectSchema(dbSchema.productsSchema, {
        name: t.String({"minLength":1,"maxLength":255}),
        slug: t.String({"format":"slug","minLength":1,"maxLength":255}),
        price: t.Number({"minimum":0}),
        comparePrice: t.Number({"minimum":0}),
        cost: t.Number({"minimum":0}),
        sku: t.String({"maxLength":100}),
        barcode: t.String({"maxLength":100}),
        weight: t.Number({"minimum":0}),
        stock: t.Number({"default":0,"minimum":0}),
        minStock: t.Number({"default":0,"minimum":0}),
        isActive: t.Boolean({"default":true}),
        isFeatured: t.Boolean({"default":false}),
        metaTitle: t.String({"maxLength":255}),
        metaKeywords: t.String({"maxLength":500})
      }),
      reviewsSchema: createSelectSchema(dbSchema.reviewsSchema, {
        userName: t.String({"minLength":1,"maxLength":100}),
        userEmail: t.String({"format":"email","maxLength":255}),
        rating: t.Number({"minimum":1,"maximum":5}),
        title: t.String({"maxLength":255}),
        content: t.String({"minLength":1}),
        isVerified: t.Boolean({"default":false}),
        isApproved: t.Boolean({"default":false})
      }),
      siteConfigSchema: createSelectSchema(dbSchema.siteConfigSchema, {
        key: t.String({"minLength":1,"maxLength":100}),
        category: t.String({"default":"general","maxLength":50})
      }),
      advertisementsSchema: createSelectSchema(dbSchema.advertisementsSchema, {
        title: t.String({"minLength":1,"maxLength":255}),
        type: t.String({"enum":["banner","carousel"],"maxLength":50}),
        image: t.String({"minLength":1}),
        link: t.String({"format":"uri","maxLength":500}),
        position: t.String({"maxLength":100}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true})
      }),
      headerConfigSchema: createSelectSchema(dbSchema.headerConfigSchema, {
        shippingText: t.String({"default":"FREE SHIPPING on orders over $59* details","maxLength":200}),
        trackOrderText: t.String({"default":"Track Order","maxLength":100}),
        helpText: t.String({"default":"Help","maxLength":100}),
        trackOrderUrl: t.String({"default":"#","maxLength":255}),
        helpUrl: t.String({"default":"#","maxLength":255}),
        isActive: t.Boolean({"default":true})
      }),
      footerConfigSchema: createSelectSchema(dbSchema.footerConfigSchema, {
        sectionTitle: t.String({"minLength":1,"maxLength":100}),
        linkText: t.String({"minLength":1,"maxLength":100}),
        linkUrl: t.String({"minLength":1,"maxLength":255}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true})
      }),
      userProfile: createSelectSchema(dbSchema.userProfile, {
        email: t.String({"format":"email"}),
        displayName: t.String({"minLength":2,"maxLength":50})
      }),
      productCatalog: createSelectSchema(dbSchema.productCatalog, {
        title: t.String({"minLength":1,"maxLength":100}),
        price: t.Number({"minimum":0})
      }),
    }, 'select')
  }
} as const
