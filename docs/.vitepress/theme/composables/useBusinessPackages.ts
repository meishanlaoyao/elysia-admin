import { shallowRef, watch } from 'vue'
import { useData } from 'vitepress'
import type { BusinessPackage } from '../data/business-packages'

const BUSINESS_PACKAGES_PAGE = 'ecosystem/business-packages.md'

export function useBusinessPackages() {
  const { page } = useData()
  const packages = shallowRef<BusinessPackage[]>([])

  async function load() {
    if (page.value.relativePath !== BUSINESS_PACKAGES_PAGE) return
    const mod = await import('../data/business-packages')
    packages.value = mod.businessPackages
  }

  watch(() => page.value.relativePath, load, { immediate: true })

  return { packages }
}