// Every path without a file extension is a docs page; /x.md, /llms.txt and /sitemap.xml match no route and are
// served as files (by Cloudflare, or in `npm start` by the middleware in vite.config.js).
export default pageContext => !/\.\w+$/.test(pageContext.urlPathname)
