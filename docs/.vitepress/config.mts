import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Elysia Admin",
  description: "一个基于 Elysia.js + Art Design Pro 的现代化全栈后台管理系统。",
  lang: 'zh-CN',
  sitemap: {
    hostname: "https://elysia-admin.top",
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { charset: 'utf-8' }],
    ['meta', { name: 'description', content: '一个基于 Elysia.js + Art Design Pro 的现代化全栈后台管理系统。' }],
  ],
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    siteTitle: 'Elysia Admin',
    nav: [
      { text: '快速开始', link: '/start/quick-start' },
      { text: '更新日志', link: '/start/change-log' },
      { text: '相关链接', link: '/other/related-links' },
    ],
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '介绍', link: '/start/introduction' },
          { text: '快速开始', link: '/start/quick-start' },
          { text: '更新日志', link: '/start/change-log' },
        ]
      },
      {
        text: '指南',
        items: [
          { text: '第一个接口', link: '/guide/first-api' },
          { text: '参数验证', link: '/guide/parameter-validation' },
          { text: '定时任务', link: '/guide/cron' },
          { text: '数据库操作', link: '/guide/database-operation' },
          { text: '缓存操作', link: '/guide/cache' },
          { text: '文件存储', link: '/guide/storage' },
          { text: '中间件', link: '/guide/middleware' },
          { text: '队列', link: '/guide/queue' },
          { text: '部署', link: '/guide/deploy' },
        ]
      },
      {
        text: '架构',
        items: [
          { text: '项目结构', link: '/architecture/structure' },
          { text: '数据库设计', link: '/architecture/database' },
          { text: '内置命令', link: '/architecture/commands' },
        ]
      },
      {
        text: '其他',
        items: [
          { text: '常见问题', link: '/other/faq' },
          { text: '相关链接', link: '/other/related-links' },
        ]
      },
    ],
    outline: {
      level: [2, 3],
      label: '目录'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/meishanlaoyao/elysia-admin' },
      { icon: 'gitee', link: 'https://gitee.com/nian-qian/elysia-admin' },
    ],
    editLink: {
      pattern: 'https://gitee.com/nian-qian/elysia-admin/edit/main/docs/:path',
      text: '在 Gitee 上编辑此页'
    },
    lastUpdated: {
      text: '最后更新时间',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2026-present Elysia Admin | <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">湘ICP备2026013170号-1</a>'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    externalLinkIcon: true,
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索'
          },
          modal: {
            displayDetails: '显示详细列表',
            resetButtonTitle: '重置搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有结果',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: '输入',
              navigateText: '导航',
              navigateUpKeyAriaLabel: '上箭头',
              navigateDownKeyAriaLabel: '下箭头',
              closeText: '关闭',
              closeKeyAriaLabel: 'Esc'
            }
          }
        }
      }
    }
  }
})