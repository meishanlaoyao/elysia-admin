import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

export type EaLastVersion = {
  version: string
  publishDate: string
  description: string
  changelogUrl: string
  forceUpdate: boolean
}

let cached: EaLastVersion | null = null
let inflight: Promise<EaLastVersion | null> | null = null

function loadVersion(): Promise<EaLastVersion | null> {
  if (cached) return Promise.resolve(cached)
  if (!inflight) {
    inflight = fetch(withBase('/last-version.json'))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        cached = d
        return d
      })
      .catch(() => null)
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

/** 首页共享：只发起一次对 last-version.json 的请求 */
export function useEaVersion() {
  const data = ref<EaLastVersion | null>(cached)

  onMounted(() => {
    if (cached) {
      data.value = cached
      return
    }
    void loadVersion().then((d) => {
      data.value = d
    })
  })

  return { data, loadVersion }
}
