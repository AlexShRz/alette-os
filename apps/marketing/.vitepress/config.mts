import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Alette Signal",
  description: "Delightful data fetching for every Front-End",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        collapsed: false,
        items: [
          { text: 'Why Alette Signal', link: '/docs/getting-started/why-signal' },
          { text: 'Installation', link: '/docs/getting-started/installation' },
          { text: 'Configuring requests', link: '/docs/getting-started/configuring-requests' },
          { text: 'Request modes', link: '/docs/getting-started/request-modes' },
          { text: 'Request middleware', link: '/docs/getting-started/request-middleware' },
          { text: 'Api client', link: '/docs/getting-started/api-configuration' },
          { text: 'Api plugins', link: '/docs/getting-started/api-plugins' },
          { text: 'Api context', link: '/docs/getting-started/api-context' },
        ]
      },
      {
        text: 'Middleware Reference',
        collapsed: true,
        items: [
          { text: 'How to read middleware reference', link: '/docs/middleware-reference/how-to' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
