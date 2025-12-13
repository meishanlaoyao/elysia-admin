import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Elysia-Admin",
  description: "基于 Elysia 框架的现代化后端管理系统",
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/introduction' },
      { text: 'API', link: '/api/system-user' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '项目介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '配置说明', link: '/guide/configuration' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '数据库操作', link: '/guide/database' },
            { text: '路由系统', link: '/guide/routing' },
            { text: '通用工具', link: '/guide/common-utils' }
          ]
        },
        {
          text: '部署',
          items: [
            { text: '部署指南', link: '/guide/deployment' }
          ]
        },
        {
          text: '其他',
          items: [
            { text: '架构设计', link: '/guide/architecture' },
            { text: '常见问题', link: '/guide/faq' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 文档',
          items: [
            { text: '系统用户', link: '/api/system-user' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://gitee.com/nian-qian/elysia-admin' }
    ],

    footer: {
      message: '基于 Elysia 框架构建',
      copyright: 'Copyright © 2025'
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: '目录'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    editLink: {
      pattern: 'https://gitee.com/nian-qian/elysia-admin/edit/master/docs/:path',
      text: '在 Gitee 上编辑此页'
    },

    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
