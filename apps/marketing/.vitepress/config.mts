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
          { text: 'Configuring requests', link: '/docs/getting-started/configuring-requests' },
          { text: 'Request modes', link: '/docs/getting-started/request-modes' },
          { text: 'Request middleware', link: '/docs/getting-started/request-middleware' },
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
