import { navbar } from 'vuepress-theme-hope';

export const navbarConfig = navbar([
  {
    text: '首页',
    icon: 'home',
    link: '/'
  },
  {
    text: '索引',
    icon: 'jiansuo',
    children: [
      { text: '全部', icon: 'list', link: '/article' },
      { text: '分类', icon: 'category', link: '/category' },
      { text: '标签', icon: 'tag', link: '/tag' },
      { text: '时间轴', icon: 'time', link: '/timeline' },
    ],
  },
  {
    text: '收藏',
    icon: 'start',
    link: '/favorite',
    children: ['/favorite/links', '/favorite/movies', '/favorite/music', '/favorite/photos'],
  },
  '/about',
]);