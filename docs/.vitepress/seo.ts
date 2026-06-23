import type { HeadConfig, PageData, SiteData } from 'vitepress'

export const SITE_URL = 'https://elysia-admin.top'
export const SITE_NAME = 'Elysia Admin'
export const DEFAULT_DESCRIPTION =
  'Elysia Admin 是一套基于 Bun + ElysiaJS + DrizzleORM + Vue3 的高性能全栈后台管理系统，开箱即用，内置 RBAC、JWT、定时任务、队列等企业级功能。'
export const DEFAULT_OG_IMAGE = '/big-logo.webp'

export const ORGANIZATION_ID = `${SITE_URL}/#organization`

export const DEFAULT_KEYWORDS =
  'Elysia Admin 官网, Elysia Admin 官方文档, elysia-admin, elysia-admin.top, Bun, ElysiaJS, Vue3, DrizzleORM, 全栈后台管理系统'

export const PAGE_KEYWORDS: Record<string, string> = {
  'index.md':
    'Elysia Admin 官网, Elysia Admin 官方文档, elysia-admin, elysia-admin.top, ElysiaJS 后台管理系统, Bun Vue3 全栈, DrizzleORM, RBAC, JWT, 开源后台',
  'start/introduction.md':
    'Elysia Admin 官网, Elysia Admin 项目介绍, elysia-admin, ElysiaJS, Bun, Vue3, Art Design Pro, RBAC权限, JWT认证, DrizzleORM, TypeScript',
  'start/quick-start.md':
    'Elysia Admin 快速开始, elysia-admin 安装, Bun 开发环境, PostgreSQL, Redis, 源码下载, 项目配置',
  'start/change-log.md':
    'Elysia Admin 更新日志, elysia-admin changelog, 版本记录, 新功能, 问题修复',
  'guide/ai-guide.md':
    'Elysia Admin AI 开发, Cursor 规则, Claude Code, Codex, 模块脚手架, create:module, .ai 工作流, 提示词',
  'guide/first-api.md':
    'Elysia Admin 第一个接口, API 开发, 配置式路由, DTO 校验, route.ts, handle.ts, 模块化',
  'guide/parameter-validation.md':
    'Elysia Admin 参数验证, Elysia TypeBox, CrudDto, BaseListQueryDto, DTO 校验, 请求校验',
  'guide/cron.md':
    'Elysia Admin 定时任务, BullMQ Cron, 沙箱进程, 任务调度, 多实例部署',
  'guide/database-operation.md':
    'Elysia Admin 数据库操作, DrizzleORM, PostgreSQL CRUD, 事务, 分页查询, 联表查询',
  'guide/cache.md':
    'Elysia Admin Redis 缓存, WithCache, CacheInsert, 缓存击穿, 分布式锁',
  'guide/storage.md':
    'Elysia Admin 文件存储, S3 对象存储, RustFS, 预签名 URL, 直传上传',
  'guide/middleware.md':
    'Elysia Admin 中间件, AuthGuard, 权限守卫, IP 限流, 操作日志, 请求拦截',
  'guide/queue.md':
    'Elysia Admin 消息队列, BullMQ, 延迟任务, 任务重试, 幂等投递, 分布式队列',
  'guide/deploy.md':
    'Elysia Admin 生产部署, Docker 部署, PM2, 宝塔面板, Nginx 反向代理',
  'guide/payment.md':
    'Elysia Admin 支付集成, 支付宝, 微信支付, PayPal, 商户配置, 异步回调',
  'architecture/structure.md':
    'Elysia Admin 项目结构, 目录架构, 前端 Vue3 模块, 后端 ElysiaJS 分层, server modules',
  'architecture/database.md':
    'Elysia Admin 数据库设计, PostgreSQL 表结构, RBAC 用户角色菜单, Drizzle Schema',
  'architecture/commands.md':
    'Elysia Admin 内置命令, bun dev, bun build, Docker 命令, 数据库脚本, PM2',
  'ecosystem/business-packages.md':
    'Elysia Admin 业务包, 可复用业务模块, CMS 模块, 微信小程序业务包',
  'ecosystem/related-links.md':
    'Elysia Admin 技术栈链接, ElysiaJS 文档, Bun, DrizzleORM, BullMQ, PostgreSQL, Redis',
  'other/social.md':
    'Elysia Admin 社区, 微信交流群, QQ 群, 联系作者, 技术支持',
  'other/sponsors.md':
    'Elysia Admin 鸣谢, 开源赞助, 打赏支持',
  'other/faq.md':
    'Elysia Admin 常见问题, FAQ, PM2 集群, 多实例部署, Nginx 负载均衡',
}

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.webp`,
  description: DEFAULT_DESCRIPTION,
  sameAs: [
    'https://github.com/meishanlaoyao/elysia-admin',
    'https://gitee.com/nian-qian/elysia-admin',
  ],
}

type SeoFrontmatter = {
  ogImage?: string
  ogType?: string
  ogTitle?: string
  ogDescription?: string
  noindex?: boolean
}

export function pagePath(relativePath: string): string {
  if (relativePath === 'index.md') return '/'
  return `/${relativePath.replace(/\.md$/, '.html')}`
}

export function pageUrl(relativePath: string): string {
  const path = pagePath(relativePath)
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`
}

export function ogImageUrl(imagePath?: string): string {
  const path = imagePath || DEFAULT_OG_IMAGE
  return path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function isHomePage(relativePath: string): boolean {
  return relativePath === 'index.md'
}

function resolveTitle(pageData: PageData, siteData: SiteData): string {
  const fm = pageData.frontmatter as SeoFrontmatter
  return fm.ogTitle || pageData.title || siteData.title
}

function resolveDescription(pageData: PageData, siteData: SiteData): string {
  const fm = pageData.frontmatter as SeoFrontmatter
  return fm.ogDescription || pageData.description || siteData.description
}

function resolveKeywords(relativePath: string): string {
  return PAGE_KEYWORDS[relativePath] ?? DEFAULT_KEYWORDS
}

function resolveOgType(pageData: PageData): string {
  const fm = pageData.frontmatter as SeoFrontmatter
  if (fm.ogType) return fm.ogType
  return isHomePage(pageData.relativePath) ? 'website' : 'article'
}

function buildCanonicalHead(url: string, noindex?: boolean): HeadConfig[] {
  const head: HeadConfig[] = [['link', { rel: 'canonical', href: url }]]
  if (noindex) {
    head.push(['meta', { name: 'robots', content: 'noindex, nofollow' }])
  }
  return head
}

function buildSocialHead(
  title: string,
  description: string,
  url: string,
  ogType: string,
  imageUrl: string,
): HeadConfig[] {
  return [
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:type', content: ogType }],
    ['meta', { property: 'og:image', content: imageUrl }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: imageUrl }],
  ]
}

function buildJsonLdScript(graph: Record<string, unknown>[]): HeadConfig {
  return [
    'script',
    { type: 'application/ld+json' },
    JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
  ]
}

function buildHomeJsonLd(description: string, url: string): HeadConfig {
  return buildJsonLdScript([
    ORGANIZATION,
    {
      '@type': 'WebSite',
      name: `${SITE_NAME} 官方文档`,
      url: SITE_URL,
      description,
      inLanguage: 'zh-CN',
      publisher: { '@id': ORGANIZATION_ID },
    },
    {
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Cross-platform',
      description,
      url,
      author: { '@id': ORGANIZATION_ID },
      publisher: { '@id': ORGANIZATION_ID },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'CNY',
      },
    },
  ])
}

function buildArticleJsonLd(
  title: string,
  description: string,
  url: string,
  dateModified?: number,
): HeadConfig {
  const article: Record<string, unknown> = {
    '@type': 'TechArticle',
    headline: title,
    description,
    url,
    inLanguage: 'zh-CN',
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    isPartOf: {
      '@type': 'WebSite',
      name: `${SITE_NAME} 官方文档`,
      url: SITE_URL,
    },
  }
  if (dateModified) {
    article.dateModified = new Date(dateModified).toISOString()
  }
  return buildJsonLdScript([ORGANIZATION, article])
}

export function buildSeoHead(ctx: {
  pageData: PageData
  siteData: SiteData
}): HeadConfig[] {
  const { pageData, siteData } = ctx
  const fm = pageData.frontmatter as SeoFrontmatter
  const url = pageUrl(pageData.relativePath)
  const title = resolveTitle(pageData, siteData)
  const description = resolveDescription(pageData, siteData)
  const ogType = resolveOgType(pageData)
  const imageUrl = ogImageUrl(fm.ogImage)
  const keywords = resolveKeywords(pageData.relativePath)

  const head: HeadConfig[] = [
    ...buildCanonicalHead(url, fm.noindex),
    ['meta', { name: 'keywords', content: keywords }],
    ...buildSocialHead(title, description, url, ogType, imageUrl),
  ]

  if (isHomePage(pageData.relativePath)) {
    head.push(buildHomeJsonLd(description, url))
  } else {
    head.push(buildArticleJsonLd(title, description, url, pageData.lastUpdated))
  }

  return head
}