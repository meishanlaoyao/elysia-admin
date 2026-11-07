declare namespace Api {
  namespace SystemVersion {
    /** 单个版本条目（当前版本与历史版本共用） */
    interface VersionItem {
      version: string
      releaseTime: string
      title: string
      forceUpdate: boolean
      content: string
    }

    /** 版本信息（当前版本 + 历史版本列表） */
    interface VersionInfo {
      current: VersionItem
      history: VersionItem[]
    }
  }
}
