/**
 * 快速入口配置
 * 包含：应用列表、快速链接等配置
 */
import { WEB_LINKS } from '@/utils/constants'
import type { FastEnterConfig } from '@/types/config'

const fastEnterConfig: FastEnterConfig = {
  // 显示条件（屏幕宽度）
  minWidth: 1200,
  // 应用列表
  applications: [
    {
      name: '工作台',
      description: '系统概览与数据统计',
      icon: 'ri:pie-chart-line',
      iconColor: '#377dff',
      enabled: true,
      order: 1,
      routeName: 'Console'
    },
    {
      name: '分析页',
      description: '数据分析与可视化',
      icon: 'ri:game-line',
      iconColor: '#ff3b30',
      enabled: false,
      order: 2,
      routeName: 'Analysis'
    },
    {
      name: '礼花效果',
      description: '动画特效展示',
      icon: 'ri:loader-line',
      iconColor: '#7A7FFF',
      enabled: false,
      order: 3,
      routeName: 'Fireworks'
    },
    {
      name: '聊天',
      description: '即时通讯功能',
      icon: 'ri:user-line',
      iconColor: '#13DEB9',
      enabled: false,
      order: 4,
      routeName: 'Chat'
    },
    {
      name: 'Elysia Admin',
      description: 'Elysia Admin 官方文档',
      icon: 'ri:book-line',
      iconColor: '#8b5cf6',
      enabled: true,
      order: 5,
      link: WEB_LINKS.DOCS
    },
    {
      name: '后台模板',
      description: 'Art Design Pro 官方文档',
      icon: 'ri:bill-line',
      iconColor: '#5D87FF',
      enabled: true,
      order: 6,
      link: WEB_LINKS.ART_DESIGN_PRO
    },
    {
      name: '后端框架',
      description: 'Elysia 框架官方文档',
      icon: 'ri:gamepad-line',
      iconColor: '#fb64b6',
      enabled: true,
      order: 7,
      link: WEB_LINKS.ELYSIA_FRAMEWORK
    }
  ],
  // 快速链接
  quickLinks: [
    {
      name: '登录',
      enabled: false,
      order: 1,
      routeName: 'Login'
    },
    {
      name: '注册',
      enabled: false,
      order: 2,
      routeName: 'Register'
    },
    {
      name: '忘记密码',
      enabled: false,
      order: 3,
      routeName: 'ForgetPassword'
    },
    {
      name: '定价',
      enabled: false,
      order: 4,
      routeName: 'Pricing'
    },
    {
      name: '个人中心',
      enabled: true,
      order: 5,
      routeName: 'UserCenter'
    },
    {
      name: '留言管理',
      enabled: false,
      order: 6,
      routeName: 'ArticleComment'
    }
  ]
}

export default Object.freeze(fastEnterConfig)