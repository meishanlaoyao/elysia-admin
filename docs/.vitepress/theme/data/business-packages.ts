/** 业务包展示条目（贡献者在 businessPackages 数组中追加） */
export type BusinessPackage = {
  /** 唯一标识，建议 kebab-case，与封面文件名等保持一致 */
  id: string
  /** 业务包名称 */
  name: string
  /** 支持的 Elysia Admin 版本，如 `['1.4.x']` */
  eaVersions: string[]
  /** 简介，卡片内最多展示两行 */
  description: string
  /** 作者 / 贡献者显示名 */
  author: string
  /** 封面图路径（`docs/public/` 下相对路径）或完整 URL */
  cover: string
  /** 跳转链接（仓库、文档或 Release 地址） */
  url: string
  /** 可选：仓库 Star 挂件，shields.io 的 `<img>` HTML 或图片 URL */
  badge?: string
};

/** 业务包列表：贡献者提 PR 在此追加条目，详见 /ecosystem/business-packages#contribute */
export const businessPackages: BusinessPackage[] = [
  {
    id: 'ea-cms',
    name: 'EA-CMS',
    eaVersions: ['1.4.10'],
    description: '面向 Elysia Admin 的可拷贝式 CMS 业务模块，提供文章、分类、标签的后台管理能力，含完整 RBAC 权限与菜单配置。',
    author: 'EA-CMS',
    cover: '',
    url: 'https://gitee.com/nian-qian/ea-cms',
    badge: `<a href='https://gitee.com/nian-qian/ea-cms/stargazers'><img src='https://gitee.com/nian-qian/ea-cms/badge/star.svg?theme=dark' alt='star'></img></a>`,
  },
];