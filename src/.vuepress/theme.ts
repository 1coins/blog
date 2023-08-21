import { hopeTheme } from 'vuepress-theme-hope';
import { navbarConfig } from './navbar/navbar.js';
import { sidebarConfig } from './sidebar/sidebar.js';

const footerICP_HTML = `
<a class="footer-about" href="https://music.163.com/#/song?id=31838335" target="_blank">
冷月如刀砍落花，落花笑我太卑贱
</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a class="footer-about" href="/about/website.html">关于本站</a>`;

export default hopeTheme({
  hostname: 'https://1coins.github.io',
  author: {
    name: '乾元',
    url: 'https://github.com/1coins',
    email: 'lau5464@126.com',
  },
  iconAssets: [
    '//at.alicdn.com/t/c/font_3855310_p3z6ugbxr7a.css',
    '//at.alicdn.com/t/c/font_2922463_kweia6fbo9.css'
  ],
  logo: '/pwa/144.png',
  docsDir: 'src',
  editLink: false,
  fullscreen: true,
  navbarAutoHide: 'always',
  footer: footerICP_HTML,
  pageInfo: [
    'Author',
    'Category',
    'Date',
    'Original',
    'Tag',
    'ReadingTime',
    'Word',
    'PageView',
    //..
  ],

  blog: {
    avatar: '/avatar.gif',
    roundAvatar: true,
    medias: {
      Email: 'mailto:lau5464@126.com',
      GitHub: 'https://github.com/1coins',
      Rss: '/feed.json',
    },
  },

  navbarLayout: {
    start: ['Brand'],
    center: [],
    end: ['Search', 'Links', 'Language', 'Outlook'],
  },

  locales: {
    '/': {
      navbar: navbarConfig,
      sidebar: sidebarConfig,
      blog: {
        name: '乾元',
        description: '念念不忘，必有回响。',
        intro: '/about/me.html',
        timeline: '美好的事情即将发生',
      },
    },
  },

  plugins: {
    blog: true,
    comment: {
      provider: 'Waline',
      serverURL: 'https://blog-comment-puce-iota.vercel.app',
      copyright: false,
      reaction: true,
    },

    // all features are enabled for demo, only preserve features you need here
    mdEnhance: {
      align: true,
      attrs: true,
      chart: true,
      codetabs: true,
      demo: true,
      echarts: true,
      figure: true,
      flowchart: true,
      gfm: true,
      imgLazyload: true,
      imgSize: true,
      include: true,
      katex: true,
      mark: true,
      mermaid: true,
      playground: {
        presets: ['ts', 'vue'],
      },
      presentation: ['highlight', 'math', 'search', 'notes', 'zoom'],
      stylize: [
        {
          matcher: 'Recommended',
          replacer: ({ tag }) => {
            if (tag === 'em')
              return {
                tag: 'Badge',
                attrs: { type: 'tip' },
                content: 'Recommended',
              };
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      vPre: true,
      vuePlayground: true,
    },

    pwa: {
      favicon: '/favicon.png',
      cacheHTML: true,
      cachePic: true,
      appendBase: true,
      apple: {
        icon: '/pwa/144.png',
        statusBarColor: 'black',
      },
      msTile: {
        image: '/pwa/144.png',
        color: '#000',
      },
      manifest: {
        icons: [
          {
            src: '/pwa/512.png',
            sizes: '512x512',
            purpose: 'maskable',
            type: 'image/png',
          },
          {
            src: '/pwa/192.png',
            sizes: '192x192',
            purpose: 'maskable',
            type: 'image/png',
          },
          {
            src: '/pwa/512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa/192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
        shortcuts: [
          {
            name: '乾元',
            short_name: '乾元',
            url: '/',
            icons: [
              {
                src: '/pwa/192.png',
                sizes: '192x192',
                purpose: 'maskable',
                type: 'image/png',
              },
            ],
          },
        ],
      },
    },
    feed: {
      json: true,
    },
  },
});