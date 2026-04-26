import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin, localIconLoader } from 'vitepress-plugin-group-icons'
import vitepressProtectPlugin from "vitepress-protect-plugin"
import { withMermaid } from 'vitepress-plugin-mermaid'
import timeline from "vitepress-markdown-timeline"
import llmstxtPlugin from 'vitepress-plugin-llmstxt'

function loaderCustomIcon(path: string) {
  return localIconLoader(import.meta.url, path)
    .replace(/^\s*<\?xml[\s\S]*?\?>\s*/i, '')
    .replace(/^\s*<!doctype[\s\S]*?>\s*/i, '')
};

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
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
      [
        'script',
        {},
        `var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?59968d8a96f97cb28289b78ca79b5477";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();`
      ],
    ],
    ignoreDeadLinks: true,
    markdown: {
      config(md) {
        md.use(groupIconMdPlugin)
        md.use(timeline)
      },
      image: {
        lazyLoading: true,
      },
      lineNumbers: true,
    },
    vite: {
      plugins: [
        groupIconVitePlugin({
          // https://icon-sets.iconify.design/logos/?category=Logos
          customIcon: {
            ts: 'logos:typescript-icon',
            windows: 'logos:microsoft-windows-icon',
            linux: 'logos:linux-tux',
            macos: 'logos:macos',
            terminal: 'logos:terminal',
            sql: 'logos:postgresql',
            docker: 'logos:docker-icon',
            js: 'logos:javascript',
            nginx: 'logos:nginx',
            gitee: loaderCustomIcon('../public/logos/gitee.svg'),
            github: 'logos:github-icon',
          }
        }),
        vitepressProtectPlugin({
          disableF12: true, // 禁用F12开发者模式
          disableCopy: false, // 禁用文本复制
          disableSelect: false, // 禁用文本选择
        }),
        llmstxtPlugin({
          hostname: 'https://elysia-admin.top',
        }),
      ],
    },
    mermaid: {},
    mermaidPlugin: {
      class: 'mermaid my-class'
    },
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
            { text: '社交', link: '/other/social' },
            { text: '常见问题', link: '/other/faq' },
            { text: '相关链接', link: '/other/related-links' },
          ]
        },
      ],
      outline: {
        level: [2, 4],
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
          dateStyle: 'short',
          timeStyle: 'medium'
        }
      },
      footer: {
        message: 'Released under the MIT License.',
        copyright: `Copyright © 2026-${new Date().getFullYear()} Elysia Admin | <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">湘ICP备2026013170号-1</a>`,
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
)