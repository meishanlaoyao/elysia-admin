import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Elysia Admin",
  description: "一个基于 Elysia.js + Art Design Pro 的现代化全栈后台管理系统。",
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
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
          { text: '权限管理', link: '/guide/rbac' },
          { text: '接口开发规范', link: '/guide/api-dev' },
          { text: '文件存储', link: '/guide/storage' },
          { text: '定时任务', link: '/guide/cron' },
          { text: '日志与监控', link: '/guide/logging' },
        ]
      },
      {
        text: '架构',
        items: [
          { text: '项目结构', link: '/architecture/structure' },
          { text: '数据库设计', link: '/architecture/database' },
          { text: '全栈类型安全', link: '/architecture/type-safety' },
          { text: '内置命令', link: '/architecture/commands' },
        ]
      },
      {
        text: '运维',
        items: [
          { text: 'Docker 部署', link: '/deploy/docker' },
          { text: 'PM2 部署', link: '/deploy/pm2' },
          { text: '环境变量', link: '/deploy/env' },
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
      // { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
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
      copyright: 'Copyright © 2026-present Elysia Admin'
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