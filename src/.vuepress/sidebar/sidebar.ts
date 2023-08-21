import { sidebar } from 'vuepress-theme-hope';
import { about } from "./about.js";
import { tools } from "./tools.js";
import { favorite } from "./favorite.js";
import {index} from "./index.js"

export const sidebarConfig  = sidebar({
  '/about/': about,
  '/tools/': tools,
  '/favorite/': favorite
  // '/': index
});
