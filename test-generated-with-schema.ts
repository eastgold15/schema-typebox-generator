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
 * JSDoc 解析的 TypeBox 配置
 */
export const jsdocConfig = {
  "testSchema": {
    "insert": {
      "email": {
        "format": "email"
      },
      "name": {
        "minLength": 2,
        "maxLength": 50
      },
      "status": {
        "enum": [
          "active",
          "inactive"
        ]
      }
    },
    "select": {
      "email": {
        "format": "email"
      },
      "name": {
        "minLength": 2,
        "maxLength": 50
      },
      "status": {
        "enum": [
          "active",
          "inactive"
        ]
      }
    }
  },
  "categoriesSchema": {
    "insert": {
      "name": {
        "minLength": 1,
        "maxLength": 100
      },
      "slug": {
        "format": "slug",
        "minLength": 1,
        "maxLength": 100
      },
      "sortOrder": {
        "default": 0
      },
      "isVisible": {
        "default": true
      }
    },
    "select": {
      "name": {
        "minLength": 1,
        "maxLength": 100
      },
      "slug": {
        "format": "slug",
        "minLength": 1,
        "maxLength": 100
      },
      "sortOrder": {
        "default": 0
      },
      "isVisible": {
        "default": true
      }
    }
  },
  "productsSchema": {
    "insert": {
      "name": {
        "minLength": 1,
        "maxLength": 255
      },
      "slug": {
        "format": "slug",
        "minLength": 1,
        "maxLength": 255
      },
      "price": {
        "minimum": 0
      },
      "comparePrice": {
        "minimum": 0
      },
      "cost": {
        "minimum": 0
      },
      "sku": {
        "maxLength": 100
      },
      "barcode": {
        "maxLength": 100
      },
      "weight": {
        "minimum": 0
      },
      "stock": {
        "default": 0,
        "minimum": 0
      },
      "minStock": {
        "default": 0,
        "minimum": 0
      },
      "isActive": {
        "default": true
      },
      "isFeatured": {
        "default": false
      },
      "metaTitle": {
        "maxLength": 255
      },
      "metaKeywords": {
        "maxLength": 500
      }
    },
    "select": {
      "name": {
        "minLength": 1,
        "maxLength": 255
      },
      "slug": {
        "format": "slug",
        "minLength": 1,
        "maxLength": 255
      },
      "price": {
        "minimum": 0
      },
      "comparePrice": {
        "minimum": 0
      },
      "cost": {
        "minimum": 0
      },
      "sku": {
        "maxLength": 100
      },
      "barcode": {
        "maxLength": 100
      },
      "weight": {
        "minimum": 0
      },
      "stock": {
        "default": 0,
        "minimum": 0
      },
      "minStock": {
        "default": 0,
        "minimum": 0
      },
      "isActive": {
        "default": true
      },
      "isFeatured": {
        "default": false
      },
      "metaTitle": {
        "maxLength": 255
      },
      "metaKeywords": {
        "maxLength": 500
      }
    }
  },
  "reviewsSchema": {
    "insert": {
      "userName": {
        "minLength": 1,
        "maxLength": 100
      },
      "userEmail": {
        "format": "email",
        "maxLength": 255
      },
      "rating": {
        "minimum": 1,
        "maximum": 5
      },
      "title": {
        "maxLength": 255
      },
      "content": {
        "minLength": 1
      },
      "isVerified": {
        "default": false
      },
      "isApproved": {
        "default": false
      }
    },
    "select": {
      "userName": {
        "minLength": 1,
        "maxLength": 100
      },
      "userEmail": {
        "format": "email",
        "maxLength": 255
      },
      "rating": {
        "minimum": 1,
        "maximum": 5
      },
      "title": {
        "maxLength": 255
      },
      "content": {
        "minLength": 1
      },
      "isVerified": {
        "default": false
      },
      "isApproved": {
        "default": false
      }
    }
  },
  "site_configSchema": {
    "insert": {
      "key": {
        "minLength": 1,
        "maxLength": 100
      },
      "category": {
        "default": "general",
        "maxLength": 50
      }
    },
    "select": {
      "key": {
        "minLength": 1,
        "maxLength": 100
      },
      "category": {
        "default": "general",
        "maxLength": 50
      }
    }
  },
  "advertisementsSchema": {
    "insert": {
      "title": {
        "minLength": 1,
        "maxLength": 255
      },
      "type": {
        "enum": [
          "banner",
          "carousel"
        ],
        "maxLength": 50
      },
      "image": {
        "minLength": 1
      },
      "link": {
        "format": "uri",
        "maxLength": 500
      },
      "position": {
        "maxLength": 100
      },
      "sortOrder": {
        "default": 0
      },
      "isActive": {
        "default": true
      }
    },
    "select": {
      "title": {
        "minLength": 1,
        "maxLength": 255
      },
      "type": {
        "enum": [
          "banner",
          "carousel"
        ],
        "maxLength": 50
      },
      "image": {
        "minLength": 1
      },
      "link": {
        "format": "uri",
        "maxLength": 500
      },
      "position": {
        "maxLength": 100
      },
      "sortOrder": {
        "default": 0
      },
      "isActive": {
        "default": true
      }
    }
  },
  "header_configSchema": {
    "insert": {
      "shippingText": {
        "default": "FREE SHIPPING on orders over $59* details",
        "maxLength": 200
      },
      "trackOrderText": {
        "default": "Track Order",
        "maxLength": 100
      },
      "helpText": {
        "default": "Help",
        "maxLength": 100
      },
      "trackOrderUrl": {
        "default": "#",
        "maxLength": 255
      },
      "helpUrl": {
        "default": "#",
        "maxLength": 255
      },
      "isActive": {
        "default": true
      }
    },
    "select": {
      "shippingText": {
        "default": "FREE SHIPPING on orders over $59* details",
        "maxLength": 200
      },
      "trackOrderText": {
        "default": "Track Order",
        "maxLength": 100
      },
      "helpText": {
        "default": "Help",
        "maxLength": 100
      },
      "trackOrderUrl": {
        "default": "#",
        "maxLength": 255
      },
      "helpUrl": {
        "default": "#",
        "maxLength": 255
      },
      "isActive": {
        "default": true
      }
    }
  },
  "footer_configSchema": {
    "insert": {
      "sectionTitle": {
        "minLength": 1,
        "maxLength": 100
      },
      "linkText": {
        "minLength": 1,
        "maxLength": 100
      },
      "linkUrl": {
        "minLength": 1,
        "maxLength": 255
      },
      "sortOrder": {
        "default": 0
      },
      "isActive": {
        "default": true
      }
    },
    "select": {
      "sectionTitle": {
        "minLength": 1,
        "maxLength": 100
      },
      "linkText": {
        "minLength": 1,
        "maxLength": 100
      },
      "linkUrl": {
        "minLength": 1,
        "maxLength": 255
      },
      "sortOrder": {
        "default": 0
      },
      "isActive": {
        "default": true
      }
    }
  }
} as const

/**
 * 合并后的 Schema 自定义配置
 */
export const schemaCustomizations = {
  testSchema: {
    insert: {
        email: t.String({"format":"email"}),
        name: t.String({"minLength":2,"maxLength":50}),
        status: {"enum":{"0":"\"active\"","1":"\"inactive\""}},
    },
    select: {
        email: t.String({"format":"email"}),
        name: t.String({"minLength":2,"maxLength":50}),
        status: {"enum":{"0":"\"active\"","1":"\"inactive\""}},
    }
  },
  categoriesSchema: {
    insert: {
        name: t.String({"minLength":1,"maxLength":100}),
        slug: t.String({"format":"slug","minLength":1,"maxLength":100}),
        sortOrder: t.Number({"default":0}),
        isVisible: t.Boolean({"default":true}),
    },
    select: {
        name: t.String({"minLength":1,"maxLength":100}),
        slug: t.String({"format":"slug","minLength":1,"maxLength":100}),
        sortOrder: t.Number({"default":0}),
        isVisible: t.Boolean({"default":true}),
    }
  },
  productsSchema: {
    insert: {
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
        metaKeywords: t.String({"maxLength":500}),
    },
    select: {
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
        metaKeywords: t.String({"maxLength":500}),
    }
  },
  reviewsSchema: {
    insert: {
        userName: t.String({"minLength":1,"maxLength":100}),
        userEmail: t.String({"format":"email","maxLength":255}),
        rating: t.Number({"minimum":1,"maximum":5}),
        title: t.String({"maxLength":255}),
        content: t.String({"minLength":1}),
        isVerified: t.Boolean({"default":false}),
        isApproved: t.Boolean({"default":false}),
    },
    select: {
        userName: t.String({"minLength":1,"maxLength":100}),
        userEmail: t.String({"format":"email","maxLength":255}),
        rating: t.Number({"minimum":1,"maximum":5}),
        title: t.String({"maxLength":255}),
        content: t.String({"minLength":1}),
        isVerified: t.Boolean({"default":false}),
        isApproved: t.Boolean({"default":false}),
    }
  },
  site_configSchema: {
    insert: {
        key: t.String({"minLength":1,"maxLength":100}),
        category: t.String({"default":"general","maxLength":50}),
    },
    select: {
        key: t.String({"minLength":1,"maxLength":100}),
        category: t.String({"default":"general","maxLength":50}),
    }
  },
  advertisementsSchema: {
    insert: {
        title: t.String({"minLength":1,"maxLength":255}),
        type: t.String({"enum":["banner","carousel"],"maxLength":50}),
        image: t.String({"minLength":1}),
        link: t.String({"format":"uri","maxLength":500}),
        position: t.String({"maxLength":100}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true}),
    },
    select: {
        title: t.String({"minLength":1,"maxLength":255}),
        type: t.String({"enum":["banner","carousel"],"maxLength":50}),
        image: t.String({"minLength":1}),
        link: t.String({"format":"uri","maxLength":500}),
        position: t.String({"maxLength":100}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true}),
    }
  },
  header_configSchema: {
    insert: {
        shippingText: t.String({"default":"FREE SHIPPING on orders over $59* details","maxLength":200}),
        trackOrderText: t.String({"default":"Track Order","maxLength":100}),
        helpText: t.String({"default":"Help","maxLength":100}),
        trackOrderUrl: t.String({"default":"#","maxLength":255}),
        helpUrl: t.String({"default":"#","maxLength":255}),
        isActive: t.Boolean({"default":true}),
    },
    select: {
        shippingText: t.String({"default":"FREE SHIPPING on orders over $59* details","maxLength":200}),
        trackOrderText: t.String({"default":"Track Order","maxLength":100}),
        helpText: t.String({"default":"Help","maxLength":100}),
        trackOrderUrl: t.String({"default":"#","maxLength":255}),
        helpUrl: t.String({"default":"#","maxLength":255}),
        isActive: t.Boolean({"default":true}),
    }
  },
  footer_configSchema: {
    insert: {
        sectionTitle: t.String({"minLength":1,"maxLength":100}),
        linkText: t.String({"minLength":1,"maxLength":100}),
        linkUrl: t.String({"minLength":1,"maxLength":255}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true}),
    },
    select: {
        sectionTitle: t.String({"minLength":1,"maxLength":100}),
        linkText: t.String({"minLength":1,"maxLength":100}),
        linkUrl: t.String({"minLength":1,"maxLength":255}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true}),
    }
  },
} as const

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
      site_configSchema: createInsertSchema(dbSchema.site_configSchema, {
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
      header_configSchema: createInsertSchema(dbSchema.header_configSchema, {
        shippingText: t.String({"default":"FREE SHIPPING on orders over $59* details","maxLength":200}),
        trackOrderText: t.String({"default":"Track Order","maxLength":100}),
        helpText: t.String({"default":"Help","maxLength":100}),
        trackOrderUrl: t.String({"default":"#","maxLength":255}),
        helpUrl: t.String({"default":"#","maxLength":255}),
        isActive: t.Boolean({"default":true})
      }),
      footer_configSchema: createInsertSchema(dbSchema.footer_configSchema, {
        sectionTitle: t.String({"minLength":1,"maxLength":100}),
        linkText: t.String({"minLength":1,"maxLength":100}),
        linkUrl: t.String({"minLength":1,"maxLength":255}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true})
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
      site_configSchema: createSelectSchema(dbSchema.site_configSchema, {
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
      header_configSchema: createSelectSchema(dbSchema.header_configSchema, {
        shippingText: t.String({"default":"FREE SHIPPING on orders over $59* details","maxLength":200}),
        trackOrderText: t.String({"default":"Track Order","maxLength":100}),
        helpText: t.String({"default":"Help","maxLength":100}),
        trackOrderUrl: t.String({"default":"#","maxLength":255}),
        helpUrl: t.String({"default":"#","maxLength":255}),
        isActive: t.Boolean({"default":true})
      }),
      footer_configSchema: createSelectSchema(dbSchema.footer_configSchema, {
        sectionTitle: t.String({"minLength":1,"maxLength":100}),
        linkText: t.String({"minLength":1,"maxLength":100}),
        linkUrl: t.String({"minLength":1,"maxLength":255}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true})
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
      site_configSchema: createInsertSchema(dbSchema.site_configSchema, {
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
      header_configSchema: createInsertSchema(dbSchema.header_configSchema, {
        shippingText: t.String({"default":"FREE SHIPPING on orders over $59* details","maxLength":200}),
        trackOrderText: t.String({"default":"Track Order","maxLength":100}),
        helpText: t.String({"default":"Help","maxLength":100}),
        trackOrderUrl: t.String({"default":"#","maxLength":255}),
        helpUrl: t.String({"default":"#","maxLength":255}),
        isActive: t.Boolean({"default":true})
      }),
      footer_configSchema: createInsertSchema(dbSchema.footer_configSchema, {
        sectionTitle: t.String({"minLength":1,"maxLength":100}),
        linkText: t.String({"minLength":1,"maxLength":100}),
        linkUrl: t.String({"minLength":1,"maxLength":255}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true})
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
      site_configSchema: createSelectSchema(dbSchema.site_configSchema, {
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
      header_configSchema: createSelectSchema(dbSchema.header_configSchema, {
        shippingText: t.String({"default":"FREE SHIPPING on orders over $59* details","maxLength":200}),
        trackOrderText: t.String({"default":"Track Order","maxLength":100}),
        helpText: t.String({"default":"Help","maxLength":100}),
        trackOrderUrl: t.String({"default":"#","maxLength":255}),
        helpUrl: t.String({"default":"#","maxLength":255}),
        isActive: t.Boolean({"default":true})
      }),
      footer_configSchema: createSelectSchema(dbSchema.footer_configSchema, {
        sectionTitle: t.String({"minLength":1,"maxLength":100}),
        linkText: t.String({"minLength":1,"maxLength":100}),
        linkUrl: t.String({"minLength":1,"maxLength":255}),
        sortOrder: t.Number({"default":0}),
        isActive: t.Boolean({"default":true})
      }),
    }, 'select')
  }
} as const
