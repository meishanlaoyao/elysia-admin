import DefaultTheme from 'vitepress/theme'
import './style.css'

export default {
    extends: DefaultTheme,
    enhanceApp({ app, router, siteData }) {
        // 可以在这里注册全局组件或添加其他增强功能
    }
}
